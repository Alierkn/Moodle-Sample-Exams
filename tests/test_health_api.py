"""
Tests for the Health API endpoints.

This module contains unit tests for the health API endpoints, testing system health,
database connections, Supabase connectivity, and metrics endpoints.
"""

import os
import unittest
import json
from unittest.mock import patch, MagicMock
import pytest
from flask import Flask

# Import the modules to test
from health_api import health_api
from health_check import HealthCheck

class TestHealthAPI(unittest.TestCase):
    """Test cases for the Health API endpoints."""

    def setUp(self):
        """Set up test fixtures."""
        # Create a Flask test app
        self.app = Flask(__name__)
        self.app.register_blueprint(health_api, url_prefix='/api')
        self.client = self.app.test_client()
        
        # Mock the health_check_service
        self.patcher = patch('health_api.health_check_service')
        self.mock_health_service = self.patcher.start()
        
        # Mock DBManager
        self.db_patcher = patch('health_api.DBManager')
        self.mock_db_manager = self.db_patcher.start()
        
        # Mock SupabaseClient
        self.supabase_patcher = patch('health_api.SupabaseClient')
        self.mock_supabase = self.supabase_patcher.start()

    def tearDown(self):
        """Tear down test fixtures."""
        self.patcher.stop()
        self.db_patcher.stop()
        self.supabase_patcher.stop()

    def test_system_health_endpoint(self):
        """Test the system health endpoint."""
        # Mock health check service response
        mock_health_data = {
            'timestamp': '2025-06-12T14:30:00Z',
            'system': {
                'status': 'healthy',
                'cpu': {'percent': 25.0, 'count': 8},
                'memory': {'percent': 45.0, 'available': 8589934592, 'total': 17179869184}
            },
            'services': {
                'neo4j': {'status': 'healthy'},
                'mongodb': {'status': 'healthy'},
                'mysql': {'status': 'healthy'},
                'web_api': {'status': 'healthy'},
                'frontend': {'status': 'healthy'}
            },
            'overall_status': 'healthy'
        }
        self.mock_health_service.check_system_health.return_value = mock_health_data
        
        # Make request to the endpoint
        response = self.client.get('/api/health')
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['overall_status'], 'healthy')
        self.assertIn('system', data)
        self.assertIn('services', data)
        self.assertIn('timestamp', data)
        
        # Verify health check service was called
        self.mock_health_service.check_system_health.assert_called_once()

    def test_system_health_degraded(self):
        """Test the system health endpoint with degraded status."""
        # Mock health check service response with degraded status
        mock_health_data = {
            'timestamp': '2025-06-12T14:30:00Z',
            'system': {
                'status': 'healthy',
                'cpu': {'percent': 25.0, 'count': 8},
                'memory': {'percent': 45.0, 'available': 8589934592, 'total': 17179869184}
            },
            'services': {
                'neo4j': {'status': 'healthy'},
                'mongodb': {'status': 'unhealthy', 'details': {'error': 'Connection refused'}},
                'mysql': {'status': 'healthy'},
                'web_api': {'status': 'healthy'},
                'frontend': {'status': 'healthy'}
            },
            'overall_status': 'degraded'
        }
        self.mock_health_service.check_system_health.return_value = mock_health_data
        
        # Make request to the endpoint
        response = self.client.get('/api/health')
        
        # Verify response
        self.assertEqual(response.status_code, 503)  # Service Unavailable
        data = json.loads(response.data)
        self.assertEqual(data['overall_status'], 'degraded')

    def test_database_health_endpoint(self):
        """Test the database health endpoint."""
        # Mock DBManager instance
        mock_db_instance = MagicMock()
        self.mock_db_manager.return_value = mock_db_instance
        
        # Mock SQLAlchemy session
        mock_session = MagicMock()
        mock_db_instance.get_sqlalchemy_session.return_value = mock_session
        
        # Mock SQLAlchemy engine
        mock_engine = MagicMock()
        mock_db_instance.sqlalchemy_engine = mock_engine
        mock_engine.pool.size.return_value = 5
        mock_engine.pool.checkedout.return_value = 2
        
        # Mock MongoDB client
        mock_mongo_client = MagicMock()
        mock_db_instance.mongo_client = mock_mongo_client
        mock_mongo_client.server_info.return_value = {'version': '4.4.0'}
        
        # Mock Neo4j driver
        mock_neo4j_driver = MagicMock()
        mock_db_instance.neo4j_driver = mock_neo4j_driver
        mock_neo4j_session = MagicMock()
        mock_neo4j_driver.session.return_value.__enter__.return_value = mock_neo4j_session
        
        # Mock MySQL connection
        mock_mysql_conn = MagicMock()
        mock_db_instance.get_mysql_connection.return_value = mock_mysql_conn
        mock_mysql_cursor = MagicMock()
        mock_mysql_conn.cursor.return_value = mock_mysql_cursor
        
        # Make request to the endpoint
        response = self.client.get('/api/health/database')
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('databases', data)
        self.assertIn('sqlalchemy', data['databases'])
        self.assertIn('mongodb', data['databases'])
        self.assertIn('neo4j', data['databases'])
        self.assertIn('mysql', data['databases'])
        
        # Verify database methods were called
        mock_db_instance.get_sqlalchemy_session.assert_called_once()
        mock_session.execute.assert_called_once_with("SELECT 1")
        mock_mongo_client.admin.command.assert_called_once_with('ping')
        mock_neo4j_driver.session.assert_called_once()
        mock_db_instance.get_mysql_connection.assert_called_once()
        mock_mysql_cursor.execute.assert_called_once_with("SELECT 1")

    def test_supabase_health_endpoint(self):
        """Test the Supabase health endpoint."""
        # Mock SupabaseClient instance
        mock_supabase_instance = MagicMock()
        self.mock_supabase.return_value = mock_supabase_instance
        
        # Mock Supabase client
        mock_client = MagicMock()
        mock_supabase_instance.client = mock_client
        
        # Mock table query
        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_select = MagicMock()
        mock_table.select.return_value = mock_select
        mock_response = MagicMock()
        mock_response.count = 10
        mock_select.execute.return_value = mock_response
        
        # Mock cache stats
        mock_supabase_instance._cache = {'key1': 'value1', 'key2': 'value2'}
        mock_supabase_instance.cache_hit_rate = 0.75
        
        # Make request to the endpoint
        response = self.client.get('/api/health/supabase')
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('details', data)
        self.assertEqual(data['details']['connection'], 'successful')
        self.assertEqual(data['details']['user_count'], 10)
        self.assertEqual(data['details']['cache_stats']['size'], 2)
        self.assertEqual(data['details']['cache_stats']['hit_rate'], 0.75)
        
        # Verify Supabase methods were called
        mock_client.table.assert_called_once_with('users')
        mock_table.select.assert_called_once_with('count', count='exact')
        mock_select.execute.assert_called_once()

    @patch('health_api.psutil')
    def test_system_metrics_endpoint(self, mock_psutil):
        """Test the system metrics endpoint."""
        # Mock health check service response
        self.mock_health_service.check_system_resources.return_value = {
            'status': 'healthy',
            'cpu': {'percent': 25.0, 'count': 8},
            'memory': {'percent': 45.0, 'available': 8589934592, 'total': 17179869184},
            'disk': {'percent': 60.0, 'free': 107374182400, 'total': 268435456000}
        }
        
        # Mock container metrics
        self.mock_health_service.services = {
            'neo4j': {'container': 'moodle_neo4j'},
            'mongodb': {'container': 'moodle_mongodb'},
            'mysql': {'container': 'moodle_mysql'}
        }
        
        self.mock_health_service.check_container.side_effect = lambda container: {
            'moodle_neo4j': {'is_running': True, 'status': 'running', 'cpu_percent': 5.0, 'memory_usage': 1073741824},
            'moodle_mongodb': {'is_running': True, 'status': 'running', 'cpu_percent': 3.0, 'memory_usage': 536870912},
            'moodle_mysql': {'is_running': True, 'status': 'running', 'cpu_percent': 2.0, 'memory_usage': 268435456}
        }[container]
        
        # Mock psutil boot time
        mock_psutil.boot_time.return_value = 1623499200  # 2021-06-12T12:00:00Z
        
        # Make request to the endpoint
        with patch('health_api.time.time', return_value=1623502800):  # 2021-06-12T13:00:00Z (1 hour uptime)
            response = self.client.get('/api/health/metrics')
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('system', data)
        self.assertIn('containers', data)
        self.assertIn('uptime', data)
        self.assertEqual(data['uptime'], 3600)  # 1 hour in seconds
        
        # Verify container metrics
        self.assertIn('neo4j', data['containers'])
        self.assertIn('mongodb', data['containers'])
        self.assertIn('mysql', data['containers'])
        
        # Verify health check service methods were called
        self.mock_health_service.check_system_resources.assert_called_once()
        self.assertEqual(self.mock_health_service.check_container.call_count, 3)

if __name__ == '__main__':
    unittest.main()
