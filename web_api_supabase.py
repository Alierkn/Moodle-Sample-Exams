"""
Web API for the Moodle Exam Simulator with Supabase integration
"""
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import os
import json
import sys
import datetime
import tempfile
from werkzeug.utils import secure_filename

# Import Supabase client
from supabase_client import SupabaseClient

# Import Moodle Exam Simulator module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
try:
    from moodle_exam_simulator import CodeTester
except ImportError:
    print("Moodle Exam Simulator module not found.")

app = Flask(__name__, static_folder='web-ui/build')
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

CORS(app, supports_credentials=True)  # Enable Cross-Origin Resource Sharing with credentials

# Initialize Supabase client
supabase = SupabaseClient()

# Create CodeTester instance
code_tester = None
try:
    code_tester = CodeTester()
except Exception as e:
    print(f"CodeTester could not be initialized: {e}")

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
    
    result = supabase.register_user(email, password, username)
    
    if result['success']:
        return jsonify({'success': True, 'message': 'User registered successfully'})
    else:
        return jsonify({'success': False, 'message': result.get('error', 'Registration failed')}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Missing email or password'}), 400
    
    result = supabase.login_user(email, password)
    
    if result['success']:
        session['user_id'] = result['user']['id']
        return jsonify({
            'success': True, 
            'user': result['user'],
            'token': result['session'].access_token
        })
    else:
        return jsonify({'success': False, 'message': result.get('error', 'Login failed')}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/user', methods=['GET'])
def get_user():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user info
        user = supabase.supabase.auth.get_user(token)
        user_id = user.user.id
        
        # Get user data from the database
        result = supabase.get_user(user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'user': result['user']
            })
        else:
            return jsonify({'success': False, 'message': result.get('error', 'Failed to get user data')}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 401

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user info
        user = supabase.supabase.auth.get_user(token)
        user_id = user.user.id
        
        # Get enhanced user profile with statistics and recent activities
        result = supabase.get_user_profile(user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'user': result['user']
            })
        else:
            return jsonify({'success': False, 'message': result.get('error', 'Failed to get user profile')}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 401

# Document management routes
@app.route('/api/documents', methods=['GET'])
def get_documents():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user info
        user = supabase.supabase.auth.get_user(token)
        user_id = user.user.id
        
        # Get documents for the user
        result = supabase.list_documents(user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'documents': result['documents']
            })
        else:
            return jsonify({'success': False, 'message': result.get('error', 'Failed to get documents')}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 401

@app.route('/api/documents/upload', methods=['POST'])
def upload_document():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user info
        user = supabase.supabase.auth.get_user(token)
        user_id = user.user.id
        
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file part'}), 400
        
        file = request.files['file']
        
        # If user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'}), 400
        
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Upload file to Supabase
            result = supabase.upload_document(file_path, filename, user_id)
            
            # Remove temporary file
            os.remove(file_path)
            
            if result['success']:
                # Create a resource entry
                resource_data = {
                    'title': filename,
                    'description': request.form.get('description', ''),
                    'category': request.form.get('category', 'Document'),
                    'file_path': result['storage_path'],
                    'url': result['file_url'],
                    'created_at': 'now()'
                }
                
                supabase.create_resource(resource_data)
                
                return jsonify({
                    'success': True,
                    'file_url': result['file_url'],
                    'filename': filename
                })
            else:
                return jsonify({'success': False, 'message': result.get('error', 'Upload failed')}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 401

# Challenge routes
@app.route('/api/challenges', methods=['GET'])
def get_challenges():
    try:
        result = supabase.get_challenges()
        
        if result['success']:
            return jsonify({
                'success': True,
                'challenges': result['challenges']
            })
        else:
            return jsonify({'success': False, 'message': result.get('error', 'Failed to get challenges')}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/challenges/<challenge_id>', methods=['GET'])
def get_challenge(challenge_id):
    try:
        result = supabase.get_challenge(challenge_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'challenge': result['challenge']
            })
        else:
            return jsonify({'success': False, 'message': result.get('error', 'Challenge not found')}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/challenges', methods=['POST'])
def create_challenge():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user info
        user = supabase.supabase.auth.get_user(token)
        
        data = request.json
        challenge_data = {
            'title': data.get('title'),
            'description': data.get('description'),
            'difficulty': data.get('difficulty', 'Medium'),
            'language': data.get('language', 'python'),
            'points': data.get('points', 100),
            'initial_code': data.get('initial_code', ''),
            'expected_output': data.get('expected_output', ''),
            'test_cases': json.dumps(data.get('test_cases', [])),
            'created_at': 'now()'
        }
        
        result = supabase.create_challenge(challenge_data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'challenge': result['challenge']
            })
        else:
            return jsonify({'success': False, 'message': result.get('error', 'Failed to create challenge')}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 401

@app.route('/api/run-code', methods=['POST'])
def run_code():
    data = request.json
    code = data.get('code', '')
    language = data.get('language', 'python')
    
    result = {
        'success': False,
        'output': '',
        'error': '',
        'executionTime': 0,
        'testsPassed': 0,
        'totalTests': 0
    }
    
    if not code_tester:
        result['error'] = "Code tester not initialized"
        return jsonify(result)
    
    try:
        if language == 'python':
            # Get test cases if this is a challenge
            challenge_id = data.get('challenge_id')
            test_cases = []
            
            if challenge_id:
                challenge = supabase.get_challenge(challenge_id)
                if challenge['success']:
                    test_cases_str = challenge['challenge'].get('test_cases', '[]')
                    test_cases = json.loads(test_cases_str)
            
            # If no test cases from challenge, use the input from request
            if not test_cases:
                input_data = data.get('input', '')
                expected_output = data.get('expectedOutput', '')
                test_cases = [{'input': input_data, 'expected_output': expected_output}]
            
            # Run code with test cases
            total_tests = len(test_cases)
            passed_tests = 0
            outputs = []
            errors = []
            execution_times = []
            
            for test_case in test_cases:
                input_data = test_case.get('input', '')
                expected_output = test_case.get('expected_output', '')
                
                output, error, execution_time = code_tester.run_python_code(code, input_data)
                
                # Check if output matches expected output (if provided)
                expected_match = True
                if expected_output and output:
                    expected_output = expected_output.strip()
                    output = output.strip()
                    expected_match = output == expected_output
                
                outputs.append(output)
                errors.append(error)
                execution_times.append(execution_time)
                
                if not error and expected_match:
                    passed_tests += 1
            
            # Prepare result
            result['output'] = '\n'.join(outputs)
            result['error'] = '\n'.join(filter(None, errors))
            result['executionTime'] = sum(execution_times)
            result['testsPassed'] = passed_tests
            result['totalTests'] = total_tests
            result['success'] = passed_tests == total_tests
            
            # Submit solution if this is a challenge
            if challenge_id and 'user_id' in data:
                user_id = data.get('user_id')
                if result['success']:
                    supabase.submit_challenge_solution(
                        user_id, 
                        challenge_id, 
                        code, 
                        result['executionTime']
                    )
            
        elif language == 'neo4j':
            setup_query = data.get('setupQuery', '')
            query = code
            output, error = code_tester.run_neo4j_query(query, setup_query)
            result['success'] = error == ''
            result['output'] = json.dumps(output, indent=2) if output else ''
            result['error'] = error
            result['executionTime'] = 200  # Example value
            result['testsPassed'] = 1 if error == '' else 0
            result['totalTests'] = 1
            
        elif language == 'mongodb':
            db_name = data.get('dbName', 'test')
            collection_name = data.get('collectionName', 'test')
            operation = data.get('operation', 'find')
            query = code
            output, error = code_tester.run_mongodb_query(query, db_name, collection_name, operation)
            result['success'] = error == ''
            result['output'] = json.dumps(output, indent=2) if output else ''
            result['error'] = error
            result['executionTime'] = 150  # Example value
            result['testsPassed'] = 1 if error == '' else 0
            result['totalTests'] = 1
            
        elif language == 'sql':
            db_type = data.get('dbType', 'sqlite')
            setup_query = data.get('setupQuery', '')
            query = code
            output, error = code_tester.run_sql_query(query, db_type, setup_query)
            result['success'] = error == ''
            result['output'] = str(output) if output else ''
            result['error'] = error
            result['executionTime'] = 100  # Example value
            result['testsPassed'] = 1 if error == '' else 0
            result['totalTests'] = 1
            
        else:
            result['error'] = f"Unsupported language: {language}"
            
    except Exception as e:
        result['error'] = f"Error during execution: {str(e)}"
        
    return jsonify(result)

@app.route('/api/user-challenges', methods=['GET'])
def get_user_challenges():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        # Verify token and get user info
        user = supabase.supabase.auth.get_user(token)
        user_id = user.user.id
        
        # Get user challenges
        result = supabase.get_user_challenges(user_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'user_challenges': result['user_challenges']
            })
        else:
            return jsonify({'success': False, 'message': result.get('error', 'Failed to get user challenges')}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 401

@app.route('/api/resources', methods=['GET'])
def get_resources():
    try:
        result = supabase.get_resources()
        
        if result['success']:
            return jsonify({
                'success': True,
                'resources': result['resources']
            })
        else:
            return jsonify({'success': False, 'message': result.get('error', 'Failed to get resources')}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
