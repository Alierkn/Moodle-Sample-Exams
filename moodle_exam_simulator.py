import subprocess
import sys
import json
import os
import tempfile
import traceback
from typing import Dict, Any, Tuple, List
import docker
from pymongo import MongoClient
from neo4j import GraphDatabase
import sqlite3
import psycopg2
import mysql.connector

class ExamEnvironmentSimulator:
    def __init__(self):
        self.docker_client = None
        self.containers = {}
        self.setup_docker()
        
    def setup_docker(self):
        """Initialize Docker client"""
        try:
            self.docker_client = docker.from_env()
            print("✓ Docker connection successful")
        except Exception as e:
            print(f"⚠️  Docker connection failed: {e}")
            print("Make sure Docker Desktop is running!")
    
    def start_databases(self):
        """Start required databases as Docker containers for testing"""
        print("\n🚀 Starting databases...")
        
        # Neo4j
        try:
            neo4j_container = self.docker_client.containers.run(
                "neo4j:latest",
                environment={
                    "NEO4J_AUTH": "neo4j/password123",
                    "NEO4J_dbms_memory_heap_max__size": "512M"
                },
                ports={'7687/tcp': 7688, '7474/tcp': 7475},
                detach=True,
                name="exam_neo4j",
                remove=True
            )
            self.containers['neo4j'] = neo4j_container
            print("✓ Neo4j started (port: 7687)")
        except Exception as e:
            print(f"⚠️  Failed to start Neo4j: {e}")
        
        # MongoDB
        try:
            mongo_container = self.docker_client.containers.run(
                "mongo:latest",
                ports={'27017/tcp': 27018},
                detach=True,
                name="exam_mongodb",
                remove=True
            )
            self.containers['mongodb'] = mongo_container
            print("✓ MongoDB started (port: 27017)")
        except Exception as e:
            print(f"⚠️  Failed to start MongoDB: {e}")
        
        # MySQL
        try:
            mysql_container = self.docker_client.containers.run(
                "mysql:latest",
                environment={
                    "MYSQL_ROOT_PASSWORD": "password123",
                    "MYSQL_DATABASE": "exam_db"
                },
                ports={'3306/tcp': 3307},
                detach=True,
                name="exam_mysql",
                remove=True
            )
            self.containers['mysql'] = mysql_container
            print("✓ MySQL started (port: 3306)")
        except Exception as e:
            print(f"⚠️  Failed to start MySQL: {e}")
        
        print("\n⏳ Waiting for databases to be ready (15 seconds)...")
        import time
        time.sleep(15)
        
    def stop_databases(self):
        """Stop containers"""
        print("🛑 Stopping databases...")
        for name, container in self.containers.items():
            try:
                container.stop()
                print(f"✓ {name} stopped")
            except:
                pass

class CodeTester:
    def __init__(self):
        self.test_results = []
        
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
        """Test Neo4j query"""
        result = {
            "language": "Neo4j",
            "success": False,
            "output": "",
            "error": "",
            "data": []
        }
        
        try:
            driver = GraphDatabase.driver(
                "bolt://localhost:7688",
                auth=("neo4j", "password123")
            )
            
            with driver.session() as session:
                # Run setup queries
                if setup_queries:
                    for setup_query in setup_queries:
                        session.run(setup_query)
                
                # Run the main query
                records = session.run(query)
                result["data"] = [dict(record) for record in records]
                result["output"] = json.dumps(result["data"], indent=2)
                result["success"] = True
                
            driver.close()
            
        except Exception as e:
            result["error"] = f"Neo4j Error: {str(e)}"
            
        return result
    
    def test_mongodb_query(self, db_name: str, collection_name: str, 
                          operation: str, query_data: Dict = None,
                          setup_data: List[Dict] = None) -> Dict[str, Any]:
        """Test MongoDB query"""
        result = {
            "language": "MongoDB",
            "success": False,
            "output": "",
            "error": "",
            "data": []
        }
        
        try:
            client = MongoClient('localhost', 27018)
            db = client[db_name]
            collection = db[collection_name]
            
            # Insert setup data
            if setup_data:
                collection.delete_many({})  # Clear the collection first
                collection.insert_many(setup_data)
            
            # Perform the operation
            if operation == "find":
                cursor = collection.find(query_data or {})
                result["data"] = list(cursor)
                result["output"] = json.dumps(result["data"], indent=2, default=str)
                result["success"] = True
            elif operation == "insert":
                insert_result = collection.insert_one(query_data)
                result["output"] = f"Inserted ID: {insert_result.inserted_id}"
                result["success"] = True
            elif operation == "update":
                update_result = collection.update_many(
                    query_data.get("filter", {}),
                    query_data.get("update", {})
                )
                result["output"] = f"Modified: {update_result.modified_count} documents"
                result["success"] = True
            elif operation == "delete":
                delete_result = collection.delete_many(query_data or {})
                result["output"] = f"Deleted: {delete_result.deleted_count} documents"
                result["success"] = True
                
            client.close()
            
        except Exception as e:
            result["error"] = f"MongoDB Error: {str(e)}"
            
        return result
    
    def test_sql_query(self, query: str, db_type: str = "sqlite",
                      setup_queries: List[str] = None) -> Dict[str, Any]:
        """Test SQL query"""
        result = {
            "language": f"SQL ({db_type})",
            "success": False,
            "output": "",
            "error": "",
            "data": []
        }
        
        try:
            if db_type == "sqlite":
                conn = sqlite3.connect(':memory:')
            elif db_type == "mysql":
                conn = mysql.connector.connect(
                    host="localhost",
                    user="root",
                    password="password123",
                    database="exam_db",
                    port=3307
                )
            elif db_type == "postgresql":
                conn = psycopg2.connect(
                    host="localhost",
                    database="exam_db",
                    user="postgres",
                    password="password123"
                )
            
            cursor = conn.cursor()
            
            # Run setup queries
            if setup_queries:
                for setup_query in setup_queries:
                    cursor.execute(setup_query)
                conn.commit()
            
            # Run the main query
            cursor.execute(query)
            
            # SELECT query
            if query.strip().upper().startswith("SELECT"):
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                result["data"] = [dict(zip(columns, row)) for row in rows]
                result["output"] = json.dumps(result["data"], indent=2)
            else:
                conn.commit()
                result["output"] = f"Query executed successfully. Rows affected: {cursor.rowcount}"
            
            result["success"] = True
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            result["error"] = f"SQL Error: {str(e)}"
            
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

# Install required libraries
def install_requirements():
    """Install required libraries"""
    requirements = [
        "docker",
        "pymongo",
        "neo4j",
        "mysql-connector-python",
        "psycopg2-binary"
    ]
    
    print("📦 Installing required libraries...")
    for req in requirements:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", req], 
                         capture_output=True)
            print(f"✓ {req} installed")
        except:
            print(f"⚠️  Failed to install {req}")

if __name__ == "__main__":
    # Check libraries
    try:
        import docker
        import pymongo
        import neo4j
    except ImportError:
        print("⚠️  Some libraries are missing. Installing...")
        install_requirements()
    
    # Start the system
    system = ExamPracticeSystem()
    system.start()
