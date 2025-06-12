# Moodle Exam Environment Simulator

This project provides a comprehensive system that simulates the Moodle exam environment. It allows students to practice with different programming languages and database technologies before exams.

## 🚀 Features

### 1. Multiple Language/Technology Support
- **Python**: Code execution, syntax checking, test cases
- **Neo4j**: Graph database queries
- **MongoDB**: NoSQL queries (find, insert, update, delete)
- **SQL**: SQLite, MySQL, PostgreSQL support

### 2. Automatic Error Detection
- Syntax errors
- Runtime errors
- Timeout control
- Expected output comparison

### 3. Test Environment
- Real databases with Docker containers
- Isolated test environment
- Setup queries support

### 4. Practice Features
- Sample exam questions
- Step-by-step testing
- Detailed error reports
- Comparative result display

### 5. Web Interface
- Modern React-based user interface
- Code editor and result display
- Challenge list and leaderboard
- Language/database selection and customizable parameters
- Real-time test results

## 📋 Installation

### Backend Requirements:
```bash
pip install docker pymongo neo4j mysql-connector-python psycopg2-binary flask flask-cors
```

- Docker Desktop must be installed and running

### Frontend Requirements:
```bash
cd web-ui
npm install
```

### Run the CLI Program:
```bash
python moodle_exam_simulator.py
```

### Run the Web API and Frontend:
```bash
# Start the API
python web_api.py

# Start the frontend in a separate terminal window
cd web-ui
npm start
```

You can access the web interface from your browser at http://localhost:3000.

## 💡 Usage Examples

### Python Test:
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)

print(factorial(5))
```

### Neo4j Query:
```cypher
MATCH (n:Person)-[:KNOWS]->(m:Person)
WHERE n.age > 25
RETURN n.name, m.name
```

### MongoDB Query:
```json
{
  "name": {"$regex": "^A"},
  "age": {"$gte": 18}
}
```

### SQL Query:
```sql
SELECT s.name, AVG(g.score) as avg_score
FROM students s
JOIN grades g ON s.id = g.student_id
GROUP BY s.id, s.name
HAVING AVG(g.score) > 70
```

## 🏁 Pre-Exam Practice Tips

- **Syntax Practice**: Test basic syntax in each language
- **Error Management**: Learn common errors
- **Performance**: Pay attention to timeouts
- **Data Structures**: Understand the features of each database

With this system, you can detect and practice issues caused by compiler differences in Moodle before your exams!
