"""
Tests for the Database Manager module.

This module contains unit tests for the DBManager class, testing connection pooling,
retry mechanisms, and thread safety.
"""

import os
import unittest
import threading
import time
from unittest.mock import patch, MagicMock
import pytest
from sqlalchemy.exc import OperationalError
from pymongo.errors import ConnectionFailure
from neo4j.exceptions import ServiceUnavailable

# Import the module to test
from db_manager import DBManager

class TestDBManager(unittest.TestCase):
    """Test cases for the DBManager class."""

    def setUp(self):
        """Set up test fixtures."""
        # Save original environment variables
        self.original_env = os.environ.copy()
        
        # Set test environment variables
        os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        os.environ['NEO4J_HOST'] = 'localhost'
        os.environ['NEO4J_PORT'] = '7687'
        os.environ['NEO4J_USER'] = 'neo4j'
        os.environ['NEO4J_PASSWORD'] = 'password'
        os.environ['MONGO_HOST'] = 'localhost'
        os.environ['MONGO_PORT'] = '27017'
        os.environ['MYSQL_HOST'] = 'localhost'
        os.environ['MYSQL_PORT'] = '3306'
        os.environ['MYSQL_USER'] = 'test'
        os.environ['MYSQL_PASSWORD'] = 'test'
        os.environ['MYSQL_DATABASE'] = 'test'
        
        # Reset the singleton instance
        DBManager._instance = None

    def tearDown(self):
        """Tear down test fixtures."""
        # Restore original environment variables
        os.environ.clear()
        os.environ.update(self.original_env)
        
        # Close any open connections
        if DBManager._instance:
            DBManager._instance.close_all_connections()
            DBManager._instance = None

    @patch('db_manager.create_engine')
    def test_singleton_pattern(self, mock_create_engine):
        """Test that DBManager follows the singleton pattern."""
        # Mock SQLAlchemy engine
        mock_engine = MagicMock()
        mock_create_engine.return_value = mock_engine
        
        # Create two instances
        db_manager1 = DBManager()
        db_manager2 = DBManager()
        
        # Verify they are the same instance
        self.assertIs(db_manager1, db_manager2)
        
        # Verify create_engine was called only once
        mock_create_engine.assert_called_once()

    @patch('db_manager.create_engine')
    @patch('db_manager.MongoClient')
    @patch('db_manager.GraphDatabase')
    @patch('db_manager.mysql.connector.pooling.MySQLConnectionPool')
    def test_initialize_connections(self, mock_mysql_pool, mock_neo4j, mock_mongo, mock_create_engine):
        """Test that connections are initialized correctly."""
        # Mock SQLAlchemy engine
        mock_engine = MagicMock()
        mock_create_engine.return_value = mock_engine
        
        # Create DBManager instance
        db_manager = DBManager()
        
        # Verify all connections were initialized
        mock_create_engine.assert_called_once()
        mock_mongo.assert_called_once()
        mock_neo4j.driver.assert_called_once()
        mock_mysql_pool.assert_called_once()

    @patch('db_manager.create_engine')
    def test_get_sqlalchemy_session(self, mock_create_engine):
        """Test getting a SQLAlchemy session."""
        # Mock SQLAlchemy engine and session
        mock_engine = MagicMock()
        mock_session = MagicMock()
        mock_engine.begin.return_value.__enter__.return_value = mock_session
        mock_create_engine.return_value = mock_engine
        
        # Create DBManager instance
        db_manager = DBManager()
        
        # Get a session
        session = db_manager.get_sqlalchemy_session()
        
        # Verify session was created
        self.assertIsNotNone(session)
        mock_engine.begin.assert_called_once()

    @patch('db_manager.create_engine')
    @patch('db_manager.MongoClient')
    def test_get_mongodb_database(self, mock_mongo, mock_create_engine):
        """Test getting a MongoDB database."""
        # Mock MongoDB client
        mock_mongo_client = MagicMock()
        mock_mongo.return_value = mock_mongo_client
        
        # Mock SQLAlchemy engine
        mock_engine = MagicMock()
        mock_create_engine.return_value = mock_engine
        
        # Create DBManager instance
        db_manager = DBManager()
        
        # Get a MongoDB database
        db = db_manager.get_mongodb_database('test_db')
        
        # Verify database was retrieved
        self.assertIsNotNone(db)
        mock_mongo_client.__getitem__.assert_called_once_with('test_db')

    @patch('db_manager.create_engine')
    @patch('db_manager.GraphDatabase')
    def test_get_neo4j_session(self, mock_neo4j, mock_create_engine):
        """Test getting a Neo4j session."""
        # Mock Neo4j driver and session
        mock_driver = MagicMock()
        mock_session = MagicMock()
        mock_driver.session.return_value = mock_session
        mock_neo4j.driver.return_value = mock_driver
        
        # Mock SQLAlchemy engine
        mock_engine = MagicMock()
        mock_create_engine.return_value = mock_engine
        
        # Create DBManager instance
        db_manager = DBManager()
        
        # Get a Neo4j session
        session = db_manager.get_neo4j_session()
        
        # Verify session was created
        self.assertIsNotNone(session)
        mock_driver.session.assert_called_once()

    @patch('db_manager.create_engine')
    @patch('db_manager.mysql.connector.pooling.MySQLConnectionPool')
    def test_get_mysql_connection(self, mock_mysql_pool, mock_create_engine):
        """Test getting a MySQL connection."""
        # Mock MySQL pool and connection
        mock_pool = MagicMock()
        mock_connection = MagicMock()
        mock_pool.get_connection.return_value = mock_connection
        mock_mysql_pool.return_value = mock_pool
        
        # Mock SQLAlchemy engine
        mock_engine = MagicMock()
        mock_create_engine.return_value = mock_engine
        
        # Create DBManager instance
        db_manager = DBManager()
        
        # Get a MySQL connection
        conn = db_manager.get_mysql_connection()
        
        # Verify connection was retrieved
        self.assertIsNotNone(conn)
        mock_pool.get_connection.assert_called_once()

    @patch('db_manager.create_engine')
    def test_retry_mechanism(self, mock_create_engine):
        """Test retry mechanism for database connections."""
        # Mock SQLAlchemy engine that fails the first two times
        mock_engine = MagicMock()
        mock_create_engine.side_effect = [
            OperationalError("mock error", None, None),
            OperationalError("mock error", None, None),
            mock_engine
        ]
        
        # Create DBManager instance with retry
        with patch('db_manager.time.sleep') as mock_sleep:  # Mock sleep to speed up test
            db_manager = DBManager()
        
        # Verify create_engine was called three times
        self.assertEqual(mock_create_engine.call_count, 3)
        
        # Verify sleep was called twice
        self.assertEqual(mock_sleep.call_count, 2)

    @patch('db_manager.create_engine')
    def test_thread_safety(self, mock_create_engine):
        """Test thread safety of DBManager."""
        # Mock SQLAlchemy engine
        mock_engine = MagicMock()
        mock_create_engine.return_value = mock_engine
        
        # Create DBManager instances in multiple threads
        def create_instance():
            return DBManager()
        
        threads = []
        instances = []
        
        for _ in range(10):
            thread = threading.Thread(target=lambda: instances.append(create_instance()))
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # Verify all instances are the same
        first_instance = instances[0]
        for instance in instances[1:]:
            self.assertIs(instance, first_instance)
        
        # Verify create_engine was called only once
        mock_create_engine.assert_called_once()

    @patch('db_manager.create_engine')
    @patch('db_manager.MongoClient')
    @patch('db_manager.GraphDatabase')
    @patch('db_manager.mysql.connector.pooling.MySQLConnectionPool')
    def test_close_all_connections(self, mock_mysql_pool, mock_neo4j, mock_mongo, mock_create_engine):
        """Test closing all connections."""
        # Mock connections
        mock_engine = MagicMock()
        mock_mongo_client = MagicMock()
        mock_driver = MagicMock()
        mock_pool = MagicMock()
        
        mock_create_engine.return_value = mock_engine
        mock_mongo.return_value = mock_mongo_client
        mock_neo4j.driver.return_value = mock_driver
        mock_mysql_pool.return_value = mock_pool
        
        # Create DBManager instance
        db_manager = DBManager()
        
        # Close all connections
        db_manager.close_all_connections()
        
        # Verify all connections were closed
        mock_engine.dispose.assert_called_once()
        mock_mongo_client.close.assert_called_once()
        mock_driver.close.assert_called_once()

if __name__ == '__main__':
    unittest.main()
