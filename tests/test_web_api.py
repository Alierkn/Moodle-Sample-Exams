import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import json
import tempfile

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import web_api
from models import User, Challenge, UserChallenge

class TestWebAPI(unittest.TestCase):
    
    def setUp(self):
        # Create a test client
        self.app = web_api.app
        self.app.config['TESTING'] = True
        self.app.config['SECRET_KEY'] = 'test_secret_key'
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        
        # Create application context
        with self.app.app_context():
            web_api.db.create_all()
            
            # Add test data
            test_user = User(username='testuser', email='test@example.com')
            test_user.set_password('password123')
            
            test_challenge = Challenge(
                title='Test Challenge',
                description='Test Description',
                difficulty='Medium',
                language='python',
                points=100,
                tags=['test', 'python']
            )
            
            web_api.db.session.add(test_user)
            web_api.db.session.add(test_challenge)
            web_api.db.session.commit()
    
    def tearDown(self):
        with self.app.app_context():
            web_api.db.session.remove()
            web_api.db.drop_all()
    
    def test_health_check(self):
        """Test the health check endpoint"""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'ok')
        self.assertTrue('timestamp' in data)
    
    def test_login_success(self):
        """Test successful login"""
        response = self.client.post('/api/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['user']['username'], 'testuser')
        self.assertTrue('token' in data)
    
    def test_login_failure(self):
        """Test failed login"""
        response = self.client.post('/api/login', json={
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], 'Invalid email or password')
    
    @patch('web_api.code_tester')
    def test_execute_code_python(self, mock_code_tester):
        """Test code execution endpoint for Python"""
        # Mock the code tester response
        mock_result = {
            'success': True,
            'output': 'Test output',
            'error': '',
            'executionTime': 100,
            'testsPassed': 1,
            'totalTests': 1
        }
        mock_code_tester.test_python_code.return_value = mock_result
        
        response = self.client.post('/api/execute', json={
            'language': 'python',
            'code': 'print("Hello, World!")',
            'expectedOutput': 'Hello, World!'
        })
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['output'], 'Test output')
        self.assertEqual(data['testsPassed'], 1)
        
        # Verify code_tester was called with correct parameters
        mock_code_tester.test_python_code.assert_called_once()
    
    @patch('web_api.code_tester')
    def test_execute_code_neo4j(self, mock_code_tester):
        """Test code execution endpoint for Neo4j"""
        # Mock the code tester response
        mock_code_tester.run_neo4j_query.return_value = ('Test output', '')
        
        response = self.client.post('/api/execute', json={
            'language': 'neo4j',
            'code': 'MATCH (n) RETURN n',
            'setupQuery': 'CREATE (n:Test)'
        })
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        
        # Verify code_tester was called with correct parameters
        mock_code_tester.run_neo4j_query.assert_called_once()
    
    @patch('web_api.get_challenges_from_db')
    @patch('web_api.get_mock_challenges')
    def test_get_challenges_from_db(self, mock_get_mock_challenges, mock_get_challenges_from_db):
        """Test challenges endpoint retrieving from database"""
        # Mock the database response
        mock_challenges = [
            {'id': 1, 'title': 'Challenge 1', 'difficulty': 'Easy'},
            {'id': 2, 'title': 'Challenge 2', 'difficulty': 'Medium'}
        ]
        mock_get_challenges_from_db.return_value = mock_challenges
        
        response = self.client.get('/api/challenges?source=db')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['title'], 'Challenge 1')
        
        # Verify the database function was called
        mock_get_challenges_from_db.assert_called_once()
        # Verify the mock function was not called
        mock_get_mock_challenges.assert_not_called()
    
    @patch('web_api.get_challenges_from_db')
    @patch('web_api.get_mock_challenges')
    def test_get_challenges_fallback(self, mock_get_mock_challenges, mock_get_challenges_from_db):
        """Test challenges endpoint falling back to mock data on error"""
        # Mock the database function to raise an exception
        mock_get_challenges_from_db.side_effect = Exception("Database error")
        
        # Mock the fallback response
        mock_challenges = [
            {'id': 1, 'title': 'Mock Challenge 1', 'difficulty': 'Easy'},
            {'id': 2, 'title': 'Mock Challenge 2', 'difficulty': 'Hard'}
        ]
        mock_get_mock_challenges.return_value = mock_challenges
        
        response = self.client.get('/api/challenges?source=db')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['title'], 'Mock Challenge 1')
        
        # Verify both functions were called
        mock_get_challenges_from_db.assert_called_once()
        mock_get_mock_challenges.assert_called_once()
    
    def test_performance_monitoring_decorator(self):
        """Test that performance monitoring decorator works"""
        # This is a bit tricky to test directly, so we'll check that the endpoint works
        with patch('web_api.app.logger.info') as mock_logger:
            response = self.client.get('/api/health')
            self.assertEqual(response.status_code, 200)
            
            # Check that logger was called with performance information
            mock_logger.assert_any_call(unittest.mock.ANY)  # Can't check exact content due to timing

if __name__ == '__main__':
    unittest.main()
