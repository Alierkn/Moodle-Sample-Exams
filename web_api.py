from flask import Flask, request, jsonify, send_from_directory, redirect, url_for, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Challenge, UserChallenge, Resource
import subprocess
import tempfile
import os
import json
import sys
import datetime

# Import Moodle Exam Simulator module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
try:
    from moodle_exam_simulator import CodeTester
except ImportError:
    print("Moodle Exam Simulator module not found.")

app = Flask(__name__, static_folder='web-ui/build')
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///moodle_exam_simulator.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, supports_credentials=True)  # Enable Cross-Origin Resource Sharing with credentials

# Initialize database
db.init_app(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

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
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Authentication routes
@app.route('/api/register', methods=['POST'])
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
def run_code():
    data = request.json
    code = data.get('code', '')
    language = data.get('language', 'python')
    expected_output = data.get('expectedOutput', None)
    challenge_id = data.get('challengeId', None)
    
    result = {
        'success': False,
        'output': '',
        'error': '',
        'executionTime': 0,
        'memoryUsage': 0,
        'testsPassed': 0,
        'totalTests': 1,
        'details': []
    }
    
    try:
        if language == 'python':
            result = code_tester.test_python_code(code, expected_output)
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
def get_challenges():
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
