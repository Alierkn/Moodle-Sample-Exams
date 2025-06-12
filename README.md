# Moodle Exam Simulator with Supabase Integration - Optimized

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/yourusername/moodle-exam-simulator)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://github.com/yourusername/moodle-exam-simulator)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/yourusername/moodle-exam-simulator)

This project provides a comprehensive system that simulates the Moodle exam environment with Supabase backend integration. It allows students to practice with different programming languages and database technologies before exams.

## 🚀 Features

### 0. System Optimizations (New!)
- **Database Connection Pooling**: Optimized connections for SQLAlchemy, MongoDB, Neo4j, and MySQL
- **Performance Monitoring**: Comprehensive API and database performance tracking with Prometheus and Grafana
- **Caching**: Thread-safe Supabase client with TTL caching and automatic cleanup
- **Retry Mechanism**: Robust retry with exponential backoff for all database and API operations
- **Containerization**: Enhanced Docker Compose with resource limits, health checks, and monitoring
- **Unit Testing**: Comprehensive test suite for backend components
- **Centralized Logging**: Structured logging with context for all operations

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

### Quick Setup (Recommended)

We've created a setup script to make installation easier:

```bash
# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

The setup script will:
1. Check for required dependencies
2. Set up a Python virtual environment
3. Install all required Python packages
4. Create a default .env file if needed
5. Install frontend dependencies
6. Optionally start all Docker containers

### Manual Installation

#### Backend Requirements:
```bash
pip install -r requirements.txt
```

- Docker Desktop must be installed and running

#### Frontend Requirements:
```bash
cd web-ui
npm install
```

### Run the CLI Program:
```bash
python moodle_exam_simulator.py
```

### Run with Docker (Recommended):
```bash
# Start all services with Docker Compose
docker-compose up -d
```

This will start:
- Neo4j database (port 7474, 7687)
- MongoDB database (port 27017)
- MySQL database (port 3306)
- Flask web API (port 5000)
- React frontend (port 3000)
- Prometheus monitoring (port 9090)
- Grafana dashboards (port 3001)

### Run Manually:
```bash
# Start the API
python web_api.py

# Start the frontend in a separate terminal window
cd web-ui
npm start
```

You can access the web interface from your browser at http://localhost:3000.

## 🧪 Testing

We've added comprehensive unit tests for the backend components:

```bash
# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_supabase_client.py
pytest tests/test_db_manager.py

# Run with coverage report
pytest --cov=. tests/

# Run performance tests
pytest tests/performance/
```

### Health Checks

The system includes health check endpoints to verify component status:

```bash
# Check overall system health
curl http://localhost:5000/api/health

# Check database connections
curl http://localhost:5000/api/health/database

# Check Supabase connection
curl http://localhost:5000/api/health/supabase
```

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

## 📊 System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│   Flask API     │────▶│   Supabase      │
│                 │     │  (with caching) │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Database Layer │
                        │  - Connection   │
                        │    Pooling      │
                        │  - Retry Logic  │
                        │  - Monitoring   │
                        └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Docker         │
                        │  Containers     │
                        │  - Neo4j        │
                        │  - MongoDB      │
                        │  - MySQL        │
                        └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  Monitoring     │
                        │  - Prometheus   │
                        │  - Grafana      │
                        │    Dashboards   │
                        └─────────────────┘
```

## 🔍 Monitoring & Performance

The system includes comprehensive monitoring and performance tracking:

### Prometheus Metrics
- API response times by endpoint
- Database query performance
- Cache hit/miss rates
- Error rates and types
- System resource utilization

### Grafana Dashboards
Access the pre-configured dashboards at http://localhost:3001 (default credentials: admin/admin):

- **Main Dashboard**: Overview of system performance
- **API Performance**: Detailed endpoint response times and request rates
- **Database Performance**: Query times and connection pool utilization
- **Error Tracking**: Real-time error monitoring and alerting

### Performance Tuning
Adjust the following parameters in your `.env` file for optimal performance:

- `CACHE_TTL`: Cache time-to-live in seconds
- `MAX_RETRIES`: Maximum retry attempts for failed operations
- `RETRY_DELAY`: Base delay between retries in milliseconds
- `*_POOL_SIZE`: Database connection pool sizes

## 🛠️ Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
