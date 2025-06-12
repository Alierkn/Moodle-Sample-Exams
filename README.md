# Moodle Exam Simulator with Supabase Integration

This project provides a comprehensive system that simulates the Moodle exam environment with Supabase backend integration. It allows students to practice with different programming languages and database technologies before exams.

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
python web_api_supabase.py

# Start the frontend in a separate terminal window
cd web-ui
npm start
```

You can access the web interface from your browser at http://localhost:3000.

## 🚀 Deployment

### Netlify Deployment (Frontend)

1. Fork or clone this repository
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Select your repository
5. Use these build settings:
   - Base directory: `web-ui`
   - Build command: `npm run build`
   - Publish directory: `web-ui/build`
6. Add these environment variables in Netlify settings:
   - `REACT_APP_API_URL`: Your backend API URL
   - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
   - `REACT_APP_SUPABASE_KEY`: Your Supabase anon key
7. Deploy the site

### Backend Deployment (Heroku)

1. Create a new Heroku app
2. Connect your GitHub repository
3. Add these buildpacks:
   - `heroku/python`
4. Add these environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase service role key
   - `FLASK_SECRET_KEY`: A secure random string
5. Deploy the app

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com/)
2. Run the SQL commands in `supabase_schema.sql` in the SQL editor
3. Create storage buckets:
   - `documents`
   - `challenges`
   - `user-solutions`
4. Set up appropriate bucket policies
5. Copy your Supabase URL and anon key for frontend configuration

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
