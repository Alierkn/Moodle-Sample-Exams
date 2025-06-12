import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import json
from datetime import datetime, timedelta

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import SupabaseClient
from supabase_config import CHALLENGES_TABLE, USERS_TABLE, RESOURCES_TABLE

class TestSupabaseClient(unittest.TestCase):
    
    def setUp(self):
        # Create a patched version of the Supabase client
        self.patcher = patch('supabase_client.create_client')
        self.mock_create_client = self.patcher.start()
        self.mock_supabase = MagicMock()
        self.mock_create_client.return_value = self.mock_supabase
        
        # Create instance of our client
        self.client = SupabaseClient()
        
    def tearDown(self):
        self.patcher.stop()
    
    def test_singleton_pattern(self):
        """Test that the singleton pattern works correctly"""
        client1 = SupabaseClient()
        client2 = SupabaseClient()
        self.assertIs(client1, client2)
    
    def test_register_user(self):
        """Test user registration functionality"""
        # Mock the auth.sign_up method
        mock_response = MagicMock()
        mock_response.user = {'id': 'test-user-id', 'email': 'test@example.com'}
        self.mock_supabase.auth.sign_up.return_value = mock_response
        
        # Mock the table insert method
        mock_table = MagicMock()
        self.mock_supabase.table.return_value = mock_table
        mock_table.insert.return_value = MagicMock(data=[{'id': 1, 'username': 'testuser'}])
        
        result = self.client.register_user('test@example.com', 'password123', 'testuser')
        
        # Assert the auth sign_up was called with correct params
        self.mock_supabase.auth.sign_up.assert_called_with({
            'email': 'test@example.com',
            'password': 'password123'
        })
        
        # Assert the table insert was called
        self.mock_supabase.table.assert_called_with(USERS_TABLE)
        mock_table.insert.assert_called_once()
        
        # Check the result
        self.assertTrue(result['success'])
        self.assertEqual(result['user']['username'], 'testuser')
    
    def test_login_user(self):
        """Test user login functionality"""
        # Mock the auth.sign_in method
        mock_response = MagicMock()
        mock_response.user = {'id': 'test-user-id', 'email': 'test@example.com'}
        self.mock_supabase.auth.sign_in_with_password.return_value = mock_response
        
        result = self.client.login_user('test@example.com', 'password123')
        
        # Assert the auth sign_in was called with correct params
        self.mock_supabase.auth.sign_in_with_password.assert_called_with({
            'email': 'test@example.com',
            'password': 'password123'
        })
        
        # Check the result
        self.assertTrue(result['success'])
        self.assertEqual(result['user']['email'], 'test@example.com')
    
    def test_get_challenges_with_cache(self):
        """Test that challenges are cached and retrieved from cache when available"""
        # Set up mock data
        mock_challenges = [
            {'id': 1, 'title': 'Challenge 1', 'difficulty': 'Easy'},
            {'id': 2, 'title': 'Challenge 2', 'difficulty': 'Medium'}
        ]
        
        # First call should query the database
        mock_query = MagicMock()
        self.mock_supabase.table.return_value = mock_query
        mock_query.select.return_value = mock_query
        mock_query.execute.return_value = MagicMock(data=mock_challenges)
        
        # First call
        result1 = self.client.get_challenges()
        
        # Assert database was queried
        self.mock_supabase.table.assert_called_with(CHALLENGES_TABLE)
        mock_query.select.assert_called_once()
        mock_query.execute.assert_called_once()
        
        # Reset mocks to verify cache usage
        self.mock_supabase.reset_mock()
        mock_query.reset_mock()
        
        # Second call should use cache
        result2 = self.client.get_challenges()
        
        # Assert database was not queried again
        self.mock_supabase.table.assert_not_called()
        
        # Both results should be identical
        self.assertEqual(result1, result2)
        self.assertEqual(len(result1), 2)
    
    def test_get_challenges_cache_expiry(self):
        """Test that cache expires after TTL"""
        # Set up mock data
        mock_challenges = [
            {'id': 1, 'title': 'Challenge 1', 'difficulty': 'Easy'},
            {'id': 2, 'title': 'Challenge 2', 'difficulty': 'Medium'}
        ]
        
        # First call should query the database
        mock_query = MagicMock()
        self.mock_supabase.table.return_value = mock_query
        mock_query.select.return_value = mock_query
        mock_query.execute.return_value = MagicMock(data=mock_challenges)
        
        # First call
        self.client.get_challenges()
        
        # Manually expire the cache by changing the timestamp
        self.client._challenge_cache_timestamp = datetime.now() - timedelta(minutes=16)
        
        # Reset mocks to verify cache expiry
        self.mock_supabase.reset_mock()
        mock_query.reset_mock()
        
        # Set up new mock data for second call
        mock_query = MagicMock()
        self.mock_supabase.table.return_value = mock_query
        mock_query.select.return_value = mock_query
        mock_query.execute.return_value = MagicMock(data=mock_challenges)
        
        # Second call should query database again due to cache expiry
        self.client.get_challenges()
        
        # Assert database was queried again
        self.mock_supabase.table.assert_called_with(CHALLENGES_TABLE)
        mock_query.select.assert_called_once()
        mock_query.execute.assert_called_once()
    
    def test_retry_decorator(self):
        """Test that retry decorator works correctly"""
        # Set up a side effect that raises an exception on first call but succeeds on second
        mock_query = MagicMock()
        self.mock_supabase.table.return_value = mock_query
        mock_query.select.return_value = mock_query
        
        # First call raises exception, second succeeds
        mock_challenges = [{'id': 1, 'title': 'Challenge 1'}]
        mock_query.execute.side_effect = [
            Exception("Connection error"),
            MagicMock(data=mock_challenges)
        ]
        
        # Call should succeed due to retry
        result = self.client.get_challenges()
        
        # Assert execute was called twice
        self.assertEqual(mock_query.execute.call_count, 2)
        
        # Result should contain the challenge
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['title'], 'Challenge 1')

if __name__ == '__main__':
    unittest.main()
