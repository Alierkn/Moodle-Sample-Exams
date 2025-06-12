"""
Health Check API for MoodleExamSimulator

This module provides API endpoints for health check functionality, integrating with
the health_check module to expose system health information via the web API.
"""

import os
import time
from flask import Blueprint, jsonify, request
from datetime import datetime
import json

# Import health check service
from health_check import health_check_service

# Import database manager
from db_manager import DBManager

# Import Supabase client
from supabase_client import SupabaseClient

# Import monitoring module
from monitoring import logger, track_performance

# Create Blueprint
health_api = Blueprint('health_api', __name__)

@health_api.route('/health', methods=['GET'])
@track_performance
def system_health():
    """
    Get overall system health status.
    
    Returns:
        JSON: System health information
    """
    try:
        # Get system health data
        health_data = health_check_service.check_system_health()
        
        # Add API version and timestamp
        health_data['api_version'] = os.environ.get('API_VERSION', '1.0.0')
        health_data['timestamp'] = datetime.utcnow().isoformat()
        
        return jsonify(health_data), 200 if health_data['overall_status'] == 'healthy' else 503
    except Exception as e:
        logger.error(f"Error checking system health: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error checking system health: {str(e)}",
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@health_api.route('/health/database', methods=['GET'])
@track_performance
def database_health():
    """
    Check database connections health.
    
    Returns:
        JSON: Database connections health information
    """
    try:
        db_manager = DBManager()
        result = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'databases': {}
        }
        
        # Check SQLAlchemy connection
        try:
            session = db_manager.get_sqlalchemy_session()
            session.execute("SELECT 1")
            result['databases']['sqlalchemy'] = {
                'status': 'healthy',
                'message': 'Connection successful',
                'pool_size': db_manager.sqlalchemy_engine.pool.size(),
                'connections_in_use': db_manager.sqlalchemy_engine.pool.checkedout()
            }
        except Exception as e:
            result['databases']['sqlalchemy'] = {
                'status': 'unhealthy',
                'message': str(e)
            }
            result['status'] = 'degraded'
        
        # Check MongoDB connection
        try:
            db_manager.mongo_client.admin.command('ping')
            result['databases']['mongodb'] = {
                'status': 'healthy',
                'message': 'Connection successful',
                'server_info': db_manager.mongo_client.server_info()
            }
        except Exception as e:
            result['databases']['mongodb'] = {
                'status': 'unhealthy',
                'message': str(e)
            }
            result['status'] = 'degraded'
        
        # Check Neo4j connection
        try:
            with db_manager.neo4j_driver.session() as session:
                session.run("RETURN 1")
            result['databases']['neo4j'] = {
                'status': 'healthy',
                'message': 'Connection successful'
            }
        except Exception as e:
            result['databases']['neo4j'] = {
                'status': 'unhealthy',
                'message': str(e)
            }
            result['status'] = 'degraded'
        
        # Check MySQL connection
        try:
            connection = db_manager.get_mysql_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            result['databases']['mysql'] = {
                'status': 'healthy',
                'message': 'Connection successful',
                'pool_size': db_manager.mysql_pool._pool_size if hasattr(db_manager, 'mysql_pool') else 'N/A'
            }
        except Exception as e:
            result['databases']['mysql'] = {
                'status': 'unhealthy',
                'message': str(e)
            }
            result['status'] = 'degraded'
        
        return jsonify(result), 200 if result['status'] == 'healthy' else 503
    except Exception as e:
        logger.error(f"Error checking database health: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error checking database health: {str(e)}",
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@health_api.route('/health/supabase', methods=['GET'])
@track_performance
def supabase_health():
    """
    Check Supabase connection health.
    
    Returns:
        JSON: Supabase connection health information
    """
    try:
        supabase_client = SupabaseClient()
        result = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'details': {}
        }
        
        # Check Supabase connection
        try:
            # Simple query to check connection
            response = supabase_client.client.table('users').select('count', count='exact').execute()
            
            result['details'] = {
                'connection': 'successful',
                'user_count': response.count if hasattr(response, 'count') else 'unknown',
                'cache_stats': {
                    'size': len(supabase_client._cache),
                    'hit_rate': supabase_client.cache_hit_rate if hasattr(supabase_client, 'cache_hit_rate') else 'unknown'
                }
            }
        except Exception as e:
            result['status'] = 'unhealthy'
            result['details'] = {
                'connection': 'failed',
                'error': str(e)
            }
        
        return jsonify(result), 200 if result['status'] == 'healthy' else 503
    except Exception as e:
        logger.error(f"Error checking Supabase health: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error checking Supabase health: {str(e)}",
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@health_api.route('/health/metrics', methods=['GET'])
@track_performance
def system_metrics():
    """
    Get detailed system metrics for monitoring.
    
    Returns:
        JSON: Detailed system metrics
    """
    try:
        # Get system resources
        resources = health_check_service.check_system_resources()
        
        # Get container metrics for all services
        container_metrics = {}
        for service_name, service_info in health_check_service.services.items():
            if "container" in service_info:
                container_status = health_check_service.check_container(service_info["container"])
                if container_status.get("is_running", False):
                    container_metrics[service_name] = {
                        "cpu_percent": container_status.get("cpu_percent", 0),
                        "memory_usage": container_status.get("memory_usage", 0),
                        "status": container_status.get("status", "unknown")
                    }
        
        # Compile metrics
        metrics = {
            'timestamp': datetime.utcnow().isoformat(),
            'system': resources,
            'containers': container_metrics,
            'uptime': time.time() - psutil.boot_time() if hasattr(psutil, 'boot_time') else 0
        }
        
        return jsonify(metrics)
    except Exception as e:
        logger.error(f"Error getting system metrics: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error getting system metrics: {str(e)}",
            'timestamp': datetime.utcnow().isoformat()
        }), 500

# Register the blueprint in your main Flask app
# In web_api.py:
# from health_api import health_api
# app.register_blueprint(health_api, url_prefix='/api')
