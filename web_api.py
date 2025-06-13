""" 
Unified Web API for the Moodle Exam Simulator

Supports both traditional database (SQL) and Supabase backends
based on configuration in .env file.
"""

from flask import Flask, request, jsonify, send_from_directory, redirect, url_for, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
import subprocess
import tempfile
import os
import json
import sys
import datetime
import logging
import time
import psutil
from functools import wraps
from dotenv import load_dotenv

# Load environment variables first to determine backend type
load_dotenv()

# Determine which backend to use based on environment variable
BACKEND_TYPE = os.environ.get('BACKEND_TYPE', 'traditional').lower()

if BACKEND_TYPE == 'supabase':
    # Import Supabase client if specified
    try:
        from supabase_client import SupabaseClient
        supabase = SupabaseClient()
        print("✅ Using Supabase backend")
    except ImportError:
        print("❌ Supabase client not found. Falling back to traditional backend.")
        BACKEND_TYPE = 'traditional'
else:
    # Traditional database setup
    from flask_login import LoginManager, login_user, logout_user, login_required, current_user
    from werkzeug.security import generate_password_hash, check_password_hash
    from werkzeug.middleware.proxy_fix import ProxyFix
    from models import db, User, Challenge, UserChallenge, Resource

# Import monitoring and health check modules
from monitoring import track_performance, api_performance_monitor, track_event, track_errors, logger
from health_check import health_check_service
from health_api import health_api

# Import Moodle Exam Simulator module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
try:
    from moodle_exam_simulator import CodeTester
except ImportError:
    print("❌ Error: Moodle Exam Simulator module not found. Functionality will be limited.")
    CodeTester = None

# Logging is now handled by the monitoring module

# Initialize Flask app
app = Flask(__name__, static_folder='web-ui/build')
CORS(app)

# Configure app
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'moodle-exam-simulator-default-key')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Configure database if using traditional backend
if BACKEND_TYPE == 'traditional':
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///moodle_exam.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    
    # Initialize login manager
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

# Apply WSGI middleware only for traditional backend
if BACKEND_TYPE == 'traditional':
    from werkzeug.middleware.proxy_fix import ProxyFix
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure cache settings
app.config['CACHE_TTL'] = int(os.environ.get('CACHE_TTL', 3600))  # Default 1 hour
app.config['MAX_RETRIES'] = int(os.environ.get('MAX_RETRIES', 3))
app.config['RETRY_DELAY'] = int(os.environ.get('RETRY_DELAY', 1000))  # milliseconds
app.config['API_VERSION'] = os.environ.get('API_VERSION', '1.1.0')

# Register health check blueprint
app.register_blueprint(health_api, url_prefix='/api/health')

# Performance monitoring is now handled by the monitoring module
# This legacy decorator is kept for backward compatibility
def performance_logger(f):
    return track_performance(f)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create CodeTester instance
code_tester = None
try:
    code_tester = CodeTester()
except Exception as e:
    print(f"CodeTester could not be initialized: {e}")

# Create database tables if they don't exist
# Record application start time for uptime tracking
app.config['START_TIME'] = time.time()

# Create database tables if they don't exist
with app.app_context():
    db.create_all()
    
    # Log application startup
    logger.info("MoodleExamSimulator API started", 
               version="1.0.0",
               environment=os.environ.get('FLASK_ENV', 'development'),
               database_url=app.config['SQLALCHEMY_DATABASE_URI'])

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
@track_performance
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Legacy health check endpoint is now handled by the health_api blueprint
# The old endpoint is kept for backward compatibility but redirects to the new one
@app.route('/api/health-legacy', methods=['GET'])
@api_performance_monitor('health_check_legacy')
def health_check_legacy():
    """Legacy health check endpoint - redirects to the new health API"""
    logger.info("Legacy health check endpoint accessed - consider updating to /api/health")
    return redirect('/api/health')

# Authentication routes
@app.route('/api/register', methods=['POST'])
@api_performance_monitor('register')
@track_event('user_registration')
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 400
    
    user = User(username=username, email=email)
    user.set_password(password)
    user.created_at = datetime.datetime.utcnow()
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'User registered successfully'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    login_user(user)
    user.last_login = datetime.datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'points': user.points,
            'streak': user.streak
        }
    })

@app.route('/api/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/user')
@login_required
def get_user():
    return jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'points': current_user.points,
            'streak': current_user.streak
        }
    })

@app.route('/api/run-code', methods=['POST'])
@login_required
@performance_logger
def run_code():
    data = request.json
    code = data.get('code', '')
    language = data.get('language', 'python').lower()
    
    # Log code execution attempt
    logger.info(f"Running {language} code, length: {len(code)} characters")
    
    result = {
        "success": False,
        "output": "",
        "error": "",
        "executionTime": 0,
        "testsPassed": 0,
        "totalTests": 0,
        "details": []
    }
    
    try:
        if language == 'python':
            # Get expected output and test cases if provided
            expected_output = data.get('expectedOutput', None)
            test_cases = data.get('testCases', None)
            
            # Use the code tester to run the Python code
            start_time = time.time()
            result = code_tester.test_python_code(code, expected_output, test_cases)
            execution_time = int((time.time() - start_time) * 1000)
            
            # Add execution details
            result['executionTime'] = execution_time
            result['details'] = [
                {
                    'name': 'Test 1: Code Execution',
                    'passed': result['error'] == '',
                    'time': f"{execution_time}ms"
                }
            ]
            
            if expected_output:
                expected_match = output.strip() == expected_output.strip()
                result['details'].append({
                    'name': 'Test 2: Expected Output Check',
                    'passed': expected_match,
                    'time': '5ms'
                })
                result['totalTests'] = 2
                result['testsPassed'] = (1 if error == '' else 0) + (1 if expected_match else 0)
                result['success'] = error == '' and expected_match
                
        elif language == 'neo4j':
            setup_query = data.get('setupQuery', '')
            query = code
            output, error = code_tester.run_neo4j_query(query, setup_query)
            result['success'] = error == ''
            result['output'] = json.dumps(output, indent=2) if output else ''
            result['error'] = error
            result['executionTime'] = 200  # Örnek değer
            result['testsPassed'] = 1 if error == '' else 0
            
        elif language == 'mongodb':
            db_name = data.get('dbName', 'test')
            collection_name = data.get('collectionName', 'test')
            operation = data.get('operation', 'find')
            query = code
            output, error = code_tester.run_mongodb_query(query, db_name, collection_name, operation)
            result['success'] = error == ''
            result['output'] = json.dumps(output, indent=2) if output else ''
            result['error'] = error
            result['executionTime'] = 150  # Örnek değer
            result['testsPassed'] = 1 if error == '' else 0
            
        elif language == 'sql':
            db_type = data.get('dbType', 'sqlite')
            setup_query = data.get('setupQuery', '')
            query = code
            output, error = code_tester.run_sql_query(query, db_type, setup_query)
            result['success'] = error == ''
            result['output'] = str(output) if output else ''
            result['error'] = error
            result['executionTime'] = 100  # Örnek değer
            result['testsPassed'] = 1 if error == '' else 0
            
        else:
            result['error'] = f"Unsupported language: {language}"
            
    except Exception as e:
        result['error'] = f"Error during execution: {str(e)}"
        
    return jsonify(result)

@app.route('/api/challenges', methods=['GET'])
@performance_logger
def get_challenges():
    try:
        # Check if we should get challenges from database
        from_db = request.args.get('from_db', 'false').lower() == 'true'
        
        if from_db:
            # Get challenges from database
            challenges_db = Challenge.query.all()
            challenges = [{
                "id": c.id,
                "title": c.title,
                "difficulty": c.difficulty,
                "language": c.language,
                "description": c.description,
                "points": c.points,
                "testCases": len(json.loads(c.test_cases)) if c.test_cases else 0,
                "completedBy": len(c.solved_by)
            } for c in challenges_db]
        else:
            # Return mock challenges if database is not ready
            challenges = [
                {
                    "id": 1,
                    "title": "Python: Fibonacci Sequence",
                    "difficulty": "Easy",
                    "language": "python",
                    "description": "Write a function that returns the nth Fibonacci number",
                    "points": 100,
                    "testCases": 3,
                    "completedBy": 45
                },
                {
                    "id": 2,
                    "title": "Neo4j: Social Network Analysis",
                    "difficulty": "Medium",
                    "language": "neo4j",
                    "description": "Find the 5 people with the most connections",
                    "points": 200,
                    "testCases": 5,
                    "completedBy": 23
                },
                {
                    "id": 3,
                    "title": "MongoDB: Aggregation Pipeline",
                    "difficulty": "Hard",
                    "language": "mongodb",
                    "description": "Group and sum product sales by category",
                    "points": 300,
                    "testCases": 7,
                    "completedBy": 12
                },
                {
                    "id": 4,
                    "title": "SQL: JOIN Operations",
                    "difficulty": "Medium",
                    "language": "sql",
                    "description": "Join 3 tables using JOIN operations",
                    "points": 250,
                    "testCases": 4,
                    "completedBy": 34
                }
            ]
        return jsonify(challenges)
    except Exception as e:
        logger.error(f"Error getting challenges: {str(e)}")
        return jsonify({"error": "Failed to retrieve challenges"}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    leaderboard = [
        {"rank": 1, "name": "John D.", "points": 2450, "solved": 24, "streak": 7},
        {"rank": 2, "name": "Emma S.", "points": 2280, "solved": 22, "streak": 5},
        {"rank": 3, "name": "Michael T.", "points": 2100, "solved": 20, "streak": 3},
        {"rank": 4, "name": "Sarah L.", "points": 1950, "solved": 18, "streak": 4},
        {"rank": 5, "name": "David P.", "points": 1800, "solved": 17, "streak": 2}
    ]
    return jsonify(leaderboard)

# This endpoint is now handled by the health_api blueprint

if __name__ == '__main__':
    # Log system information at startup
    logger.info("System information", 
               cpu_count=psutil.cpu_count(),
               memory_total=psutil.virtual_memory().total,
               python_version=sys.version)
    
    # Use Gunicorn in production
    if os.environ.get('FLASK_ENV') == 'production':
        app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
    else:
        app.run(debug=True, port=5000)
