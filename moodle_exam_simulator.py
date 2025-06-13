"""Moodle Exam Simulator Core Module

This module contains the core functionality for the Moodle Exam Simulator,
including database environment simulation, code testing, and practice exams.
"""

import subprocess
import sys
import json
import os
import time
import tempfile
import traceback
from typing import Dict, Any, Tuple, List, Optional
import importlib

# Lazy import docker to speed up initial loading
docker = None

class ExamEnvironmentSimulator:
    """Simulates database environments using Docker containers."""
    
    def __init__(self):
        self.docker_client = None
        self.containers = {}
        # Docker will be set up lazily when needed to avoid unnecessary imports
        
    def setup_docker(self):
        """Initialize Docker client (lazy loading)"""
        global docker
        
        if self.docker_client is not None:
            return  # Already initialized
            
        try:
            # Import docker only when needed
            if docker is None:
                docker = importlib.import_module('docker')
                
            self.docker_client = docker.from_env()
            print("✓ Docker connection successful")
            return True
        except ImportError:
            print("⚠️ Docker module not found. Please install: pip install docker")
            return False
        except Exception as e:
            print(f"⚠️ Docker connection failed: {e}")
            print("Make sure Docker Desktop is running!")
            return False
    
    def start_databases(self):
        """Start required databases as Docker containers for testing"""
        print("\n🚀 Starting databases...")
        
        # Ensure Docker is initialized
        if not self.docker_client and not self.setup_docker():
            print("❌ Cannot start databases: Docker not available")
            return False
        
        # Define database configurations
        db_configs = {
            'neo4j': {
                'image': 'neo4j:latest',
                'environment': {
                    'NEO4J_AUTH': 'neo4j/password123',
                    'NEO4J_dbms_memory_heap_max__size': '512M'
                },
                'ports': {'7687/tcp': 7688, '7474/tcp': 7475},
                'name': 'exam_neo4j',
                'display_port': '7687'
            },
            'mongodb': {
                'image': 'mongo:latest',
                'environment': {},
                'ports': {'27017/tcp': 27018},
                'name': 'exam_mongodb',
                'display_port': '27017'
            },
            'mysql': {
                'image': 'mysql:latest',
                'environment': {
                    'MYSQL_ROOT_PASSWORD': 'password123',
                    'MYSQL_DATABASE': 'exam_db'
                },
                'ports': {'3306/tcp': 3307},
                'name': 'exam_mysql',
                'display_port': '3306'
            }
        }
        
        # Start each database
        success_count = 0
        for db_type, config in db_configs.items():
            try:
                container = self.docker_client.containers.run(
                    config['image'],
                    environment=config['environment'],
                    ports=config['ports'],
                    detach=True,
                    name=config['name'],
                    remove=True
                )
                self.containers[db_type] = container
                print(f"✓ {db_type.capitalize()} started (port: {config['display_port']})")
                success_count += 1
            except Exception as e:
                print(f"⚠️ Failed to start {db_type.capitalize()}: {e}")
        
        if success_count > 0:
            wait_time = int(os.environ.get('DB_STARTUP_WAIT_TIME', '15'))
            print(f"\n⏳ Waiting for databases to be ready ({wait_time} seconds)...")
            time.sleep(wait_time)
            return True
        else:
            print("❌ No databases were started successfully.")
            return False
        
    def stop_databases(self):
        """Stop containers and clean up resources"""
        print("🚫 Stopping databases...")
        
        if not self.containers:
            print("ℹ️ No databases to stop")
            return
            
        for name, container in list(self.containers.items()):
            try:
                container.stop(timeout=10)  # Give containers 10 seconds to shutdown gracefully
                print(f"✓ {name.capitalize()} stopped")
            except Exception as e:
                print(f"⚠️ Failed to stop {name}: {str(e)}")
            finally:
                # Clean up the container reference regardless of stop success
                self.containers.pop(name, None)
        
        # Give Docker some time to release resources
        time.sleep(2)

class CodeTester:
    """Tests code execution for various languages and databases."""
    
    def __init__(self):
        self.test_results = []
        # Database modules will be imported only when needed
        self._neo4j_driver = None
        self._mongo_client = None
        
    def test_python_code(self, code: str, expected_output: str = None, 
                        test_cases: List[Dict] = None) -> Dict[str, Any]:
        """Test Python code"""
        result = {
            "language": "Python",
            "success": False,
            "output": "",
            "error": "",
            "test_results": []
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            f.flush()
            
            try:
                # Run the code
                process = subprocess.run(
                    [sys.executable, f.name],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                result["output"] = process.stdout
                result["error"] = process.stderr
                
                if process.returncode == 0:
                    result["success"] = True
                    
                    # Run test cases
                    if test_cases:
                        for test in test_cases:
                            test_result = self._run_test_case(f.name, test)
                            result["test_results"].append(test_result)
                    
                    # Check expected output
                    if expected_output and result["output"].strip() != expected_output.strip():
                        result["success"] = False
                        result["error"] = f"Output doesn't match!\nExpected: {expected_output}\nReceived: {result['output']}"
                        
            except subprocess.TimeoutExpired:
                result["error"] = "Code execution timed out (10 seconds)"
            except Exception as e:
                result["error"] = f"Error: {str(e)}"
            finally:
                os.unlink(f.name)
                
        return result
    
    def _run_test_case(self, filename: str, test_case: Dict) -> Dict:
        """Run a single test case"""
        test_result = {
            "name": test_case.get("name", "Test"),
            "passed": False,
            "error": ""
        }
        
        try:
            # Prepare test input
            test_code = f"""
{test_case.get('setup', '')}
exec(open('{filename}').read())
{test_case.get('test', '')}
"""
            process = subprocess.run(
                [sys.executable, "-c", test_code],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if process.returncode == 0:
                test_result["passed"] = True
            else:
                test_result["error"] = process.stderr
                
        except Exception as e:
            test_result["error"] = str(e)
            
        return test_result
    
    def test_neo4j_query(self, query: str, setup_queries: List[str] = None) -> Dict[str, Any]:
        """Test Neo4j query with lazy importing"""
        result = {
            "language": "Neo4j Cypher",
            "success": False,
            "output": "",
            "error": "",
            "test_results": []
        }
        
        try:
            # Import Neo4j only when needed
            if not hasattr(self, 'GraphDatabase') or self.GraphDatabase is None:
                try:
                    from neo4j import GraphDatabase
                    self.GraphDatabase = GraphDatabase
                except ImportError:
                    result["error"] = "Neo4j library not installed. Run: pip install neo4j"
                    return result
            
            # Connect to Neo4j
            driver = self.GraphDatabase.driver("bolt://localhost:7688", auth=("neo4j", "password123"))
            
            with driver.session() as session:
                # Run setup queries
                if setup_queries:
                    for setup_query in setup_queries:
                        session.run(setup_query)
                
                # Execute the query
                query_result = session.run(query)
                records = list(query_result)
                
                # Format the output
                if records:
                    # More structured output for better readability
                    output_lines = []
                    for i, record in enumerate(records):
                        output_lines.append(f"Record {i+1}: {record}")
                    result["output"] = "\n".join(output_lines)
                else:
                    result["output"] = "(No records returned)"
                
                result["success"] = True
            
            driver.close()
        except Exception as e:
            result["error"] = f"Neo4j error: {str(e)}"
            
        return result
    
    def test_mongodb_query(self, db_name: str, collection_name: str, 
                          operation: str, query_data: Dict = None,
                          setup_data: List[Dict] = None) -> Dict[str, Any]:
        """Test MongoDB query with lazy importing"""
        result = {
            "language": "MongoDB",
            "success": False,
            "output": "",
            "error": "",
            "data": []
        }
        
        try:
            # Import MongoDB only when needed
            if not hasattr(self, 'MongoClient') or self.MongoClient is None:
                try:
                    from pymongo import MongoClient
                    from bson.objectid import ObjectId
                    self.MongoClient = MongoClient
                    self.ObjectId = ObjectId
                except ImportError:
                    result["error"] = "PyMongo library not installed. Run: pip install pymongo"
                    return result
            
            # Connect to MongoDB
            client = self.MongoClient('mongodb://localhost:27018/', serverSelectionTimeoutMS=5000)
            # Test connection
            client.admin.command('ping')
            
            db = client[db_name]
            collection = db[collection_name]
            
            # Clear collection before running tests for clean state
            if setup_data is not None:
                collection.delete_many({})  # Clear collection
                if setup_data:  # Only insert if setup_data is not empty
                    collection.insert_many(setup_data)
                
            # Execute operation with better error handling
            if operation == 'find':
                cursor = collection.find(query_data if query_data else {})
                data = list(cursor)
                # Convert ObjectId to string for JSON serialization
                for doc in data:
                    if '_id' in doc:
                        doc['_id'] = str(doc['_id'])
                result["data"] = data
                result["output"] = json.dumps(data, indent=2)
                
            elif operation == 'insert_one':
                insert_result = collection.insert_one(query_data)
                result["output"] = f"Inserted document with ID: {insert_result.inserted_id}"
                
            elif operation == 'insert_many':
                insert_result = collection.insert_many(query_data)
                result["output"] = f"Inserted {len(insert_result.inserted_ids)} documents"
                
            elif operation == 'update_one':
                filter_doc = query_data.get('filter', {})
                update_doc = query_data.get('update', {})
                update_result = collection.update_one(filter_doc, update_doc)
                result["output"] = f"Modified {update_result.modified_count} documents"
                
            elif operation == 'update_many':
                filter_doc = query_data.get('filter', {})
                update_doc = query_data.get('update', {})
                update_result = collection.update_many(filter_doc, update_doc)
                result["output"] = f"Modified {update_result.modified_count} documents"
                
            elif operation == 'delete_one':
                delete_result = collection.delete_one(query_data)
                result["output"] = f"Deleted {delete_result.deleted_count} documents"
                
            elif operation == 'delete_many':
                delete_result = collection.delete_many(query_data)
                result["output"] = f"Deleted {delete_result.deleted_count} documents"
                
            elif operation == 'aggregate':
                cursor = collection.aggregate(query_data)
                data = list(cursor)
                # Convert ObjectId to string for JSON serialization
                for doc in data:
                    if '_id' in doc:
                        doc['_id'] = str(doc['_id'])
                result["data"] = data
                result["output"] = json.dumps(data, indent=2)
                
            else:
                result["error"] = f"Unsupported operation: {operation}"
                return result
                
            result["success"] = True
            client.close()
            
        except Exception as e:
            result["error"] = f"MongoDB Error: {str(e)}"
            
        return result
    
    def test_sql_query(self, query: str, db_type: str = "sqlite",
                      setup_queries: List[str] = None) -> Dict[str, Any]:
        """Test SQL query with lazy importing"""
        result = {
            "language": f"SQL ({db_type})",
            "success": False,
            "output": "",
            "error": "",
            "data": []
        }
        
        conn = None
        cursor = None
        
        try:
            # Connect to the database based on type with lazy imports
            if db_type == "sqlite":
                if not hasattr(self, 'sqlite3') or self.sqlite3 is None:
                    try:
                        import sqlite3
                        self.sqlite3 = sqlite3
                    except ImportError:
                        result["error"] = "sqlite3 module not available"
                        return result
                conn = self.sqlite3.connect(':memory:')
                
            elif db_type == "mysql":
                if not hasattr(self, 'mysql_connector') or self.mysql_connector is None:
                    try:
                        import mysql.connector
                        self.mysql_connector = mysql.connector
                    except ImportError:
                        result["error"] = "MySQL Connector not installed. Run: pip install mysql-connector-python"
                        return result
                try:    
                    conn = self.mysql_connector.connect(
                        host="localhost",
                        port=3307,
                        user="root",
                        password="password123",
                        database="exam_db",
                        connection_timeout=5
                    )
                except Exception as e:
                    result["error"] = f"MySQL connection failed: {str(e)}"
                    return result
                
            elif db_type == "postgresql":
                if not hasattr(self, 'psycopg2') or self.psycopg2 is None:
                    try:
                        import psycopg2
                        self.psycopg2 = psycopg2
                    except ImportError:
                        result["error"] = "psycopg2 not installed. Run: pip install psycopg2-binary"
                        return result
                try:
                    conn = self.psycopg2.connect(
                        host="localhost",
                        port=5432,
                        user="postgres",
                        password="password123",
                        database="exam_db",
                        connect_timeout=5
                    )
                except Exception as e:
                    result["error"] = f"PostgreSQL connection failed: {str(e)}"
                    return result
            else:
                result["error"] = f"Unsupported database type: {db_type}"
                return result
                
            cursor = conn.cursor()
            
            # Execute setup queries with better error handling
            if setup_queries:
                for i, setup_query in enumerate(setup_queries):
                    try:
                        cursor.execute(setup_query)
                    except Exception as e:
                        result["error"] = f"Error in setup query #{i+1}: {str(e)}\nQuery: {setup_query}"
                        return result
                conn.commit()
            
            # Execute main query
            cursor.execute(query)
            
            # Fetch results if it's a SELECT query
            if query.strip().lower().startswith("select"):
                columns = [column[0] for column in cursor.description]
                data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                result["data"] = data
                
                # Format the output in a more readable way for terminal display
                if data:
                    # Create a formatted table output
                    table_output = []
                    # Header
                    header = " | ".join(columns)
                    separator = "-" * len(header)
                    table_output.append(header)
                    table_output.append(separator)
                    
                    # Rows
                    for row_data in data:
                        row_values = [str(row_data.get(col, '')) for col in columns]
                        table_output.append(" | ".join(row_values))
                    
                    result["output"] = "\n".join(table_output)
                else:
                    result["output"] = "(No data returned)"
            else:
                result["output"] = f"Query executed successfully. Rows affected: {cursor.rowcount}"
                conn.commit()
                
            result["success"] = True
            
        except Exception as e:
            result["error"] = f"SQL Error: {str(e)}\nQuery: {query}"
            
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
                
        return result


class ExamPracticeSystem:
    def __init__(self):
        self.env_simulator = ExamEnvironmentSimulator()
        self.code_tester = CodeTester()
        
    def start(self):
        """Start system"""
        print("🎓 Moodle Exam Environment Simulator")
        print("=" * 50)
        
        # Start databases
        if input("\nDo you want to start databases in Docker? (y/n): ").lower() == 'y':
            self.env_simulator.start_databases()
        
        # Main menu
        while True:
            print("\nWhat would you like to do?")
            print("1. Test Python code")
            print("2. Test Neo4j query")
            print("3. Test MongoDB query")
            print("4. Test SQL query")
            print("5. Show sample exam question")
            print("0. Exit")
            
            choice = input("\nYour choice (0-5): ")
            
            if choice == "1":
                self.test_python()
            elif choice == "2":
                self.test_neo4j()
            elif choice == "3":
                self.test_mongodb()
            elif choice == "4":
                self.test_sql()
            elif choice == "5":
                self.practice_exam_question()
            elif choice == "0":
                break
            else:
                print("Invalid choice!")
                
        # Cleanup
        self.env_simulator.stop_databases()
        print("\n👋 Goodbye!")
    
    def test_python(self):
        """Test Python code"""
        print("\n🐍 Python Code Test")
        print("Enter your code (type 'END' to finish):")
        
        code_lines = []
        while True:
            line = input()
            if line == "END":
                break
            code_lines.append(line)
        
        code = "\n".join(code_lines)
        
        # Expected output
        expected_output = input("\nExpected output (optional): ")
        
        # Test
        result = self.code_tester.test_python_code(code, expected_output if expected_output else None)
        
        # Display results
        self._display_result(result)
    
    def test_neo4j(self):
        """Test Neo4j query"""
        print("\n🔵 Neo4j Query Test")
        
        # Setup queries
        print("\nSetup queries (optional, empty line to finish):")        
        setup_queries = []
        while True:
            setup = input("Setup query: ")
            if not setup:
                break
            setup_queries.append(setup)
        
        # Main query
        print("\nQuery to test:")
        query = input("Neo4j query: ")
        
        # Test
        result = self.code_tester.test_neo4j_query(query, setup_queries)
        
        # Display results
        self._display_result(result)
    
    def test_mongodb(self):
        """Test MongoDB query"""
        print("\n🌱 MongoDB Query Test")
        
        db_name = input("Database name: ")
        collection_name = input("Collection name: ")
        
        operation = input("\nOperation type (find/insert/update/delete): ")
        
        # Setup data
        print("\nSetup data (in JSON format, optional, empty line to finish):")
        setup_data = []
        while True:
            data_str = input("Data: ")
            if not data_str:
                break
            try:
                data = json.loads(data_str)
                setup_data.append(data)
            except json.JSONDecodeError:
                print("Invalid JSON format!")
        
        # Query data
        print("\nQuery data (in JSON format):")
        query_data = {}
        try:
            query_str = input("Query: ")
            if query_str:
                query_data = json.loads(query_str)
        except json.JSONDecodeError:
            print("Invalid JSON format!")
        
        # Test
        result = self.code_tester.test_mongodb_query(
            db_name, collection_name, operation, query_data, setup_data
        )
        
        # Display results
        self._display_result(result)
    
    def test_sql(self):
        """Test SQL query"""
        print("\n🗃️ SQL Query Test")
        
        db_type = input("Database type (sqlite/mysql/postgresql) [default: sqlite]: ") or "sqlite"
        
        # Setup queries
        print("\nSetup queries (optional, empty line to finish):")
        setup_queries = []
        while True:
            setup = input("Setup query: ")
            if not setup:
                break
            setup_queries.append(setup)
        
        # Main query
        print("\nQuery to test:")
        query = input("SQL query: ")
        
        # Test
        result = self.code_tester.test_sql_query(query, db_type, setup_queries)
        
        # Display results
        self._display_result(result)
    
    def practice_exam_question(self):
        """Sample exam question"""
        print("\n📝 Sample Exam Question")
        print("\nQuestion: Create a student database system.")
        print("Requirements:")
        print("1. Student class in Python (id, name, grade)")
        print("2. Student-course relationship in Neo4j")
        print("3. Student grades in MongoDB")
        print("4. Student table in SQL")
        
        print("\n--- SAMPLE SOLUTION ---")
        
        # Python example
        python_code = """
class Student:
    def __init__(self, id, name, grade):
        self.id = id
        self.name = name
        self.grade = grade
    
    def __str__(self):
        return f"Student({self.id}, {self.name}, {self.grade})"

# Test
s = Student(1, "Ali", 85)
print(s)
"""
        
        print("\n1. Python Code:")
        print(python_code)
        result = self.code_tester.test_python_code(python_code)
        print(f"✓ Output: {result['output'].strip()}")
        
        # Neo4j example
        neo4j_setup = [
            "CREATE (s:Student {id: 1, name: 'John'})",
            "CREATE (c:Course {code: 'CS101', name: 'Python'})",
            "CREATE (s)-[:ENROLLED_IN]->(c)"
        ]
        neo4j_query = "MATCH (s:Student)-[:ENROLLED_IN]->(c:Course) RETURN s.name, c.name"
        
        print("\n2. Neo4j Query:")
        print(f"Setup: {neo4j_setup}")
        print(f"Query: {neo4j_query}")
        
        # MongoDB example
        print("\n3. MongoDB Operation:")
        print("Collection: student_grades")
        print("Insert: {student_id: 1, course: 'CS101', grade: 85}")
        
        # SQL example
        sql_setup = [
            "CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50), grade INT)",
            "INSERT INTO students VALUES (1, 'John', 85)"
        ]
        sql_query = "SELECT * FROM students WHERE grade > 80"
        
        print("\n4. SQL Query:")
        print(f"Setup: {sql_setup}")
        print(f"Query: {sql_query}")
        result = self.code_tester.test_sql_query(sql_query, "sqlite", sql_setup)
        print(f"✓ Result: {result['output']}")
    
    def _display_result(self, result: Dict[str, Any]):
        """Display test results"""
        print(f"\n{'='*50}")
        print(f"📊 {result['language']} Test Result")
        print(f"{'='*50}")
        
        if result['success']:
            print("✅ SUCCESS")
        else:
            print("❌ FAILED")
        
        if result['output']:
            print(f"\n📤 Output:\n{result['output']}")
        
        if result['error']:
            print(f"\n⚠️  Error:\n{result['error']}")
        
        if 'test_results' in result and result['test_results']:
            print("\n🧪 Test Results:")
            for test in result['test_results']:
                status = "✓" if test['passed'] else "✗"
                print(f"  {status} {test['name']}")
                if test['error']:
                    print(f"     └─ {test['error']}")
        
        print(f"{'='*50}")

# Install required libraries on demand
def install_requirements(only_missing: bool = True) -> None:
    """Install required libraries
    
    Args:
        only_missing: If True, only install packages that are not already installed
    """
    requirements = {
        "docker": "Docker client for container management",
        "pymongo": "MongoDB client",
        "neo4j": "Neo4j graph database driver",
        "mysql-connector-python": "MySQL connector",
        "psycopg2-binary": "PostgreSQL connector"
    }
    
    print("📦 Checking required libraries...")
    for req, description in requirements.items():
        try:
            if only_missing:
                # Check if the package is already installed
                importlib.import_module(req.split('-')[0])  # Handle packages with hyphens
                print(f"✓ {req} is already installed")
                continue
            
            print(f"Installing {req} ({description})...")
            subprocess.run(
                [sys.executable, "-m", "pip", "install", req],
                capture_output=True,
                check=True
            )
            print(f"✓ {req} installed successfully")
        except ImportError:
            # Package is not installed
            print(f"Installing {req} ({description})...")
            try:
                subprocess.run(
                    [sys.executable, "-m", "pip", "install", req],
                    capture_output=True,
                    check=True
                )
                print(f"✓ {req} installed successfully")
            except subprocess.CalledProcessError as e:
                print(f"⚠️ Failed to install {req}: {e}")
        except Exception as e:
            print(f"⚠️ Error with {req}: {e}")

if __name__ == "__main__":
    print("📣 Moodle Exam Simulator")
    print("=======================\n")
    
    # Check if Docker is available without importing it first
    docker_available = False
    try:
        # Try to import the Docker module only when needed
        docker = importlib.import_module('docker')
        docker_client = docker.from_env()
        docker_client.ping()
        docker_available = True
    except ImportError:
        print("⚠️ Docker module not found. Some features will be limited.")
        install_prompt = input("Do you want to install required libraries now? (y/n): ")
        if install_prompt.lower() in ('y', 'yes'):
            install_requirements()
    except Exception:
        print("⚠️ Docker service not available. Make sure Docker is running.")
    
    # Start the system with enhanced error handling
    try:
        system = ExamPracticeSystem()
        system.start()
    except KeyboardInterrupt:
        print("\n✔️ Program terminated by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("See details below:")
        traceback.print_exc()
