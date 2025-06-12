"""
Database Connection Manager for MoodleExamSimulator

This module provides a centralized database connection manager with connection pooling
to improve performance and reliability when interacting with various databases.
"""

import os
import time
import threading
from typing import Dict, Any, Optional, Union, List
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import QueuePool
from pymongo import MongoClient
from neo4j import GraphDatabase
import mysql.connector.pooling
from dotenv import load_dotenv

# Import monitoring and retry modules
from monitoring import logger, track_performance
from retry_manager import with_retry

# Load environment variables
load_dotenv()

class DBManager:
    """
    Database connection manager for handling connections to various databases.
    Implements connection pooling for improved performance and reliability.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Singleton pattern to ensure only one database manager instance exists."""
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DBManager, cls).__new__(cls)
                cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize the database manager."""
        if self._initialized:
            return
            
        # SQLAlchemy engine and session factory
        self.sql_engine = None
        self.session_factory = None
        
        # MongoDB client
        self.mongo_client = None
        
        # Neo4j driver
        self.neo4j_driver = None
        
        # MySQL connection pool
        self.mysql_pool = None
        
        # Connection status
        self.connection_status = {
            'sqlalchemy': False,
            'mongodb': False,
            'neo4j': False,
            'mysql': False
        }
        
        # Initialize connections
        self._initialize_connections()
        
        self._initialized = True
        logger.info("Database manager initialized")
    
    @track_performance
    def _initialize_connections(self):
        """Initialize connections to all databases."""
        self._initialize_sqlalchemy()
        self._initialize_mongodb()
        self._initialize_neo4j()
        self._initialize_mysql()
    
    @with_retry(max_retries=5, retry_delay=1000)
    def _initialize_sqlalchemy(self):
        """Initialize SQLAlchemy engine with connection pooling."""
        try:
            database_url = os.environ.get('DATABASE_URL', 'sqlite:///moodle_exam_simulator.db')
            
            # Configure connection pool
            pool_size = int(os.environ.get('SQLALCHEMY_POOL_SIZE', 5))
            max_overflow = int(os.environ.get('SQLALCHEMY_MAX_OVERFLOW', 10))
            pool_timeout = int(os.environ.get('SQLALCHEMY_POOL_TIMEOUT', 30))
            pool_recycle = int(os.environ.get('SQLALCHEMY_POOL_RECYCLE', 3600))
            
            # Create engine with connection pooling
            self.sql_engine = create_engine(
                database_url,
                poolclass=QueuePool,
                pool_size=pool_size,
                max_overflow=max_overflow,
                pool_timeout=pool_timeout,
                pool_recycle=pool_recycle
            )
            
            # Create session factory
            self.session_factory = scoped_session(
                sessionmaker(autocommit=False, autoflush=False, bind=self.sql_engine)
            )
            
            # Test connection
            with self.sql_engine.connect() as conn:
                conn.execute(sqlalchemy.text("SELECT 1"))
            
            self.connection_status['sqlalchemy'] = True
            logger.info("SQLAlchemy connection initialized", 
                       database_url=database_url,
                       pool_size=pool_size,
                       max_overflow=max_overflow)
            
        except Exception as e:
            self.connection_status['sqlalchemy'] = False
            logger.error(f"Failed to initialize SQLAlchemy connection: {str(e)}")
            raise
    
    @with_retry(max_retries=5, retry_delay=1000)
    def _initialize_mongodb(self):
        """Initialize MongoDB client with connection pooling."""
        try:
            mongo_host = os.environ.get('MONGO_HOST', 'localhost')
            mongo_port = int(os.environ.get('MONGO_PORT', 27017))
            mongo_username = os.environ.get('MONGO_USERNAME', '')
            mongo_password = os.environ.get('MONGO_PASSWORD', '')
            
            # Configure connection pool
            max_pool_size = int(os.environ.get('MONGO_MAX_POOL_SIZE', 100))
            min_pool_size = int(os.environ.get('MONGO_MIN_POOL_SIZE', 0))
            max_idle_time_ms = int(os.environ.get('MONGO_MAX_IDLE_TIME_MS', 10000))
            
            # Build connection string
            if mongo_username and mongo_password:
                mongo_uri = f"mongodb://{mongo_username}:{mongo_password}@{mongo_host}:{mongo_port}/"
            else:
                mongo_uri = f"mongodb://{mongo_host}:{mongo_port}/"
            
            # Create client with connection pooling
            self.mongo_client = MongoClient(
                mongo_uri,
                maxPoolSize=max_pool_size,
                minPoolSize=min_pool_size,
                maxIdleTimeMS=max_idle_time_ms
            )
            
            # Test connection
            self.mongo_client.admin.command('ping')
            
            self.connection_status['mongodb'] = True
            logger.info("MongoDB connection initialized", 
                       host=mongo_host,
                       port=mongo_port,
                       max_pool_size=max_pool_size)
            
        except Exception as e:
            self.connection_status['mongodb'] = False
            logger.error(f"Failed to initialize MongoDB connection: {str(e)}")
            raise
    
    @with_retry(max_retries=5, retry_delay=1000)
    def _initialize_neo4j(self):
        """Initialize Neo4j driver with connection pooling."""
        try:
            neo4j_host = os.environ.get('NEO4J_HOST', 'localhost')
            neo4j_port = int(os.environ.get('NEO4J_PORT', 7687))
            neo4j_user = os.environ.get('NEO4J_USER', 'neo4j')
            neo4j_password = os.environ.get('NEO4J_PASSWORD', 'password')
            
            # Configure connection pool
            max_connection_lifetime = int(os.environ.get('NEO4J_MAX_CONN_LIFETIME', 3600))
            max_connection_pool_size = int(os.environ.get('NEO4J_MAX_CONN_POOL_SIZE', 100))
            
            # Create driver with connection pooling
            uri = f"bolt://{neo4j_host}:{neo4j_port}"
            self.neo4j_driver = GraphDatabase.driver(
                uri,
                auth=(neo4j_user, neo4j_password),
                max_connection_lifetime=max_connection_lifetime,
                max_connection_pool_size=max_connection_pool_size
            )
            
            # Test connection
            with self.neo4j_driver.session() as session:
                session.run("RETURN 1")
            
            self.connection_status['neo4j'] = True
            logger.info("Neo4j connection initialized", 
                       uri=uri,
                       max_conn_pool_size=max_connection_pool_size)
            
        except Exception as e:
            self.connection_status['neo4j'] = False
            logger.error(f"Failed to initialize Neo4j connection: {str(e)}")
            raise
    
    @with_retry(max_retries=5, retry_delay=1000)
    def _initialize_mysql(self):
        """Initialize MySQL connection pool."""
        try:
            mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
            mysql_port = int(os.environ.get('MYSQL_PORT', 3306))
            mysql_user = os.environ.get('MYSQL_USER', 'root')
            mysql_password = os.environ.get('MYSQL_PASSWORD', 'password')
            mysql_database = os.environ.get('MYSQL_DATABASE', 'moodle')
            
            # Configure connection pool
            pool_size = int(os.environ.get('MYSQL_POOL_SIZE', 5))
            pool_name = 'moodle_mysql_pool'
            
            # Create connection pool
            dbconfig = {
                'host': mysql_host,
                'port': mysql_port,
                'user': mysql_user,
                'password': mysql_password,
                'database': mysql_database
            }
            
            self.mysql_pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name=pool_name,
                pool_size=pool_size,
                **dbconfig
            )
            
            # Test connection
            with self.get_mysql_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
            
            self.connection_status['mysql'] = True
            logger.info("MySQL connection initialized", 
                       host=mysql_host,
                       port=mysql_port,
                       database=mysql_database,
                       pool_size=pool_size)
            
        except Exception as e:
            self.connection_status['mysql'] = False
            logger.error(f"Failed to initialize MySQL connection: {str(e)}")
            raise
    
    @track_performance
    def get_sqlalchemy_session(self):
        """
        Get a SQLAlchemy session from the session factory.
        
        Returns:
            SQLAlchemy session
            
        Note:
            Remember to close the session when done using:
            session.close()
        """
        if not self.session_factory:
            self._initialize_sqlalchemy()
        
        return self.session_factory()
    
    @track_performance
    def get_mongodb_database(self, database_name: str):
        """
        Get a MongoDB database from the client.
        
        Args:
            database_name: Name of the database
            
        Returns:
            MongoDB database
        """
        if not self.mongo_client:
            self._initialize_mongodb()
        
        return self.mongo_client[database_name]
    
    @track_performance
    def get_neo4j_session(self):
        """
        Get a Neo4j session from the driver.
        
        Returns:
            Neo4j session
            
        Note:
            Remember to close the session when done using:
            session.close()
        """
        if not self.neo4j_driver:
            self._initialize_neo4j()
        
        return self.neo4j_driver.session()
    
    @track_performance
    def get_mysql_connection(self):
        """
        Get a MySQL connection from the pool.
        
        Returns:
            MySQL connection
            
        Note:
            Remember to close the connection when done using:
            connection.close()
        """
        if not self.mysql_pool:
            self._initialize_mysql()
        
        return self.mysql_pool.get_connection()
    
    @track_performance
    def close_all_connections(self):
        """Close all database connections."""
        # Close SQLAlchemy
        if self.sql_engine:
            self.sql_engine.dispose()
            self.sql_engine = None
            self.session_factory = None
            self.connection_status['sqlalchemy'] = False
        
        # Close MongoDB
        if self.mongo_client:
            self.mongo_client.close()
            self.mongo_client = None
            self.connection_status['mongodb'] = False
        
        # Close Neo4j
        if self.neo4j_driver:
            self.neo4j_driver.close()
            self.neo4j_driver = None
            self.connection_status['neo4j'] = False
        
        # MySQL pool doesn't need explicit closing
        self.mysql_pool = None
        self.connection_status['mysql'] = False
        
        logger.info("All database connections closed")
    
    @track_performance
    def get_connection_status(self) -> Dict[str, bool]:
        """
        Get the status of all database connections.
        
        Returns:
            Dictionary with connection status for each database
        """
        return self.connection_status.copy()

# Create a singleton instance
db_manager = DBManager()

# Example usage
if __name__ == "__main__":
    # Get SQLAlchemy session
    session = db_manager.get_sqlalchemy_session()
    try:
        result = session.execute(sqlalchemy.text("SELECT 1")).fetchone()
        print(f"SQLAlchemy query result: {result}")
    finally:
        session.close()
    
    # Get MongoDB database
    db = db_manager.get_mongodb_database('test')
    result = db.test.find_one({}) or {"status": "empty"}
    print(f"MongoDB query result: {result}")
    
    # Get Neo4j session
    neo4j_session = db_manager.get_neo4j_session()
    try:
        result = neo4j_session.run("RETURN 'Neo4j is working' AS message").single()
        print(f"Neo4j query result: {result['message']}")
    finally:
        neo4j_session.close()
    
    # Get MySQL connection
    mysql_conn = db_manager.get_mysql_connection()
    try:
        cursor = mysql_conn.cursor()
        cursor.execute("SELECT 'MySQL is working'")
        result = cursor.fetchone()
        print(f"MySQL query result: {result}")
        cursor.close()
    finally:
        mysql_conn.close()
    
    # Get connection status
    status = db_manager.get_connection_status()
    print(f"Connection status: {status}")
    
    # Close all connections
    db_manager.close_all_connections()
