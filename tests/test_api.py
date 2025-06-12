"""
Unit tests for the MoodleExamSimulator API endpoints.

This module contains tests for the Flask API endpoints to ensure
they function correctly and handle errors appropriately.
"""

import os
import sys
import json
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Flask app
from web_api import app, db
from models import User, Challenge, UserChallenge

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # Create test data
            _create_test_data()
            yield client
            db.drop_all()

def _create_test_data():
    """Create test data for the database."""
    # Create test users
    user1 = User(username='testuser', email='test@example.com')
    user1.set_password('password123')
    
    user2 = User(username='admin', email='admin@example.com')
    user2.set_password('adminpass')
    user2.is_admin = True
    
    # Create test challenges
    challenge1 = Challenge(
        title='Test Challenge 1',
        description='A simple test challenge',
        difficulty='easy',
        category='python',
        points=10,
        created_by=1
    )
    
    challenge2 = Challenge(
        title='Test Challenge 2',
        description='A more difficult test challenge',
        difficulty='hard',
        category='sql',
        points=30,
        created_by=1
    )
    
    # Add to database
    db.session.add(user1)
    db.session.add(user2)
    db.session.add(challenge1)
    db.session.add(challenge2)
    db.session.commit()
    
    # Create user challenge attempts
    user_challenge = UserChallenge(
        user_id=1,
        challenge_id=1,
        status='completed',
        score=8,
        attempt_count=2,
        completed_at=datetime.utcnow()
    )
    
    db.session.add(user_challenge)
    db.session.commit()

def test_health_check(client):
    """Test the health check endpoint."""
    with patch('health_check.health_check_service.check_system_health') as mock_health_check:
        mock_health_check.return_value = {
            'overall_status': 'healthy',
            'services': {},
            'system': {'status': 'healthy'}
        }
        
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['overall_status'] == 'healthy'
        assert 'api' in data
        assert 'database' in data

def test_register_success(client):
    """Test successful user registration."""
    response = client.post('/api/register', json={
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'newpassword'
    })
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'user_id' in data
    
    # Verify user was created in database
    with app.app_context():
        user = User.query.filter_by(username='newuser').first()
        assert user is not None
        assert user.email == 'new@example.com'

def test_register_missing_fields(client):
    """Test registration with missing fields."""
    response = client.post('/api/register', json={
        'username': 'incomplete',
        'email': 'incomplete@example.com'
        # Missing password
    })
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['success'] is False
    assert 'Missing required fields' in data['message']

def test_register_duplicate_username(client):
    """Test registration with duplicate username."""
    response = client.post('/api/register', json={
        'username': 'testuser',  # Already exists
        'email': 'another@example.com',
        'password': 'password123'
    })
    
    assert response.status_code == 409
    data = json.loads(response.data)
    assert data['success'] is False
    assert 'Username already exists' in data['message']

def test_login_success(client):
    """Test successful login."""
    response = client.post('/api/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'user' in data
    assert data['user']['username'] == 'testuser'

def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post('/api/login', json={
        'username': 'testuser',
        'password': 'wrongpassword'
    })
    
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['success'] is False
    assert 'Invalid credentials' in data['message']

def test_get_challenges(client):
    """Test getting all challenges."""
    # Login first
    client.post('/api/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    
    response = client.get('/api/challenges')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['challenges']) == 2
    assert data['challenges'][0]['title'] == 'Test Challenge 1'
    assert data['challenges'][1]['title'] == 'Test Challenge 2'

def test_get_challenge_by_id(client):
    """Test getting a specific challenge by ID."""
    # Login first
    client.post('/api/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    
    response = client.get('/api/challenges/1')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['challenge']['title'] == 'Test Challenge 1'
    assert data['challenge']['difficulty'] == 'easy'

def test_get_nonexistent_challenge(client):
    """Test getting a challenge that doesn't exist."""
    # Login first
    client.post('/api/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    
    response = client.get('/api/challenges/999')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['success'] is False
    assert 'Challenge not found' in data['message']

def test_submit_code_python(client):
    """Test submitting Python code for evaluation."""
    # Login first
    client.post('/api/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    
    with patch('web_api.code_tester') as mock_tester:
        # Mock the code tester response
        mock_tester.test_python_code.return_value = {
            'output': 'Test output',
            'error': '',
            'execution_time': 50
        }
        
        response = client.post('/api/submit', json={
            'challenge_id': 1,
            'language': 'python',
            'code': 'print("Hello, World!")',
            'expected_output': 'Hello, World!'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['output'] == 'Test output'
        assert data['error'] == ''

def test_submit_code_error(client):
    """Test submitting code that produces an error."""
    # Login first
    client.post('/api/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    
    with patch('web_api.code_tester') as mock_tester:
        # Mock the code tester response with an error
        mock_tester.test_python_code.return_value = {
            'output': '',
            'error': 'SyntaxError: invalid syntax',
            'execution_time': 10
        }
        
        response = client.post('/api/submit', json={
            'challenge_id': 1,
            'language': 'python',
            'code': 'print("Hello, World!"',  # Missing closing parenthesis
            'expected_output': 'Hello, World!'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'SyntaxError' in data['error']

def test_user_progress(client):
    """Test getting user progress."""
    # Login first
    client.post('/api/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    
    response = client.get('/api/user/progress')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'completed_challenges' in data
    assert 'total_points' in data
    assert len(data['completed_challenges']) == 1
    assert data['completed_challenges'][0]['challenge_id'] == 1

def test_unauthorized_access(client):
    """Test accessing protected routes without authentication."""
    response = client.get('/api/challenges')
    assert response.status_code == 401
    
    response = client.get('/api/user/progress')
    assert response.status_code == 401
    
    response = client.post('/api/submit', json={
        'challenge_id': 1,
        'language': 'python',
        'code': 'print("Hello")'
    })
    assert response.status_code == 401

if __name__ == '__main__':
    pytest.main(['-v', __file__])
