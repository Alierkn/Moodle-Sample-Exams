"""
Health Check Module for MoodleExamSimulator

This module provides health check functionality for the MoodleExamSimulator system,
including database connectivity checks, Docker container status, and system resource monitoring.
"""

import os
import time
import socket
import psutil
import docker
import requests
from datetime import datetime
import json
import logging
from dotenv import load_dotenv

# Import monitoring module
from monitoring import logger, track_performance

# Load environment variables
load_dotenv()

class HealthCheck:
    """
    Health check service for MoodleExamSimulator system components.
    """
    
    def __init__(self):
        """Initialize the health check service."""
        self.docker_client = None
        self.services = {
            "neo4j": {"port": 7474, "container": "moodle_neo4j", "url": "http://localhost:7474"},
            "mongodb": {"port": 27017, "container": "moodle_mongodb"},
            "mysql": {"port": 3306, "container": "moodle_mysql"},
            "web_api": {"port": 5000, "container": "moodle_web_api", "url": "http://localhost:5000/api/health"},
            "frontend": {"port": 3000, "container": "moodle_frontend", "url": "http://localhost:3000"}
        }
        self.setup_docker()
    
    def setup_docker(self):
        """Initialize Docker client for container checks."""
        try:
            self.docker_client = docker.from_env()
            logger.info("Docker client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Docker client: {str(e)}")
            self.docker_client = None
    
    @track_performance
    def check_system_health(self):
        """
        Perform a comprehensive system health check.
        
        Returns:
            dict: Health check results for all system components
        """
        health_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "system": self.check_system_resources(),
            "services": {},
            "overall_status": "healthy"
        }
        
        # Check each service
        for service_name, service_info in self.services.items():
            service_health = self.check_service_health(service_name, service_info)
            health_data["services"][service_name] = service_health
            
            # Update overall status if any service is unhealthy
            if service_health["status"] != "healthy":
                health_data["overall_status"] = "degraded"
        
        return health_data
    
    def check_service_health(self, service_name, service_info):
        """
        Check health of a specific service.
        
        Args:
            service_name: Name of the service
            service_info: Service configuration information
            
        Returns:
            dict: Health check results for the service
        """
        health_data = {
            "status": "unknown",
            "last_checked": datetime.utcnow().isoformat(),
            "details": {}
        }
        
        # Check port connectivity
        if "port" in service_info:
            port_status = self.check_port(service_info["port"])
            health_data["details"]["port_status"] = port_status
            
            if not port_status["is_open"]:
                health_data["status"] = "unhealthy"
                health_data["details"]["error"] = f"Port {service_info['port']} is not open"
        
        # Check Docker container status
        if self.docker_client and "container" in service_info:
            container_status = self.check_container(service_info["container"])
            health_data["details"]["container_status"] = container_status
            
            if not container_status["is_running"]:
                health_data["status"] = "unhealthy"
                health_data["details"]["error"] = f"Container {service_info['container']} is not running"
        
        # Check HTTP endpoint if available
        if "url" in service_info:
            http_status = self.check_http_endpoint(service_info["url"])
            health_data["details"]["http_status"] = http_status
            
            if not http_status["is_reachable"]:
                health_data["status"] = "unhealthy"
                health_data["details"]["error"] = f"HTTP endpoint {service_info['url']} is not reachable"
        
        # If no unhealthy indicators were found, mark as healthy
        if health_data["status"] == "unknown":
            health_data["status"] = "healthy"
        
        return health_data
    
    def check_port(self, port):
        """
        Check if a port is open and accepting connections.
        
        Args:
            port: Port number to check
            
        Returns:
            dict: Port status information
        """
        result = {
            "port": port,
            "is_open": False,
            "response_time_ms": None
        }
        
        try:
            start_time = time.time()
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            
            # Try to connect to the port
            connection_result = sock.connect_ex(('localhost', port))
            response_time = time.time() - start_time
            
            # Check if connection was successful
            if connection_result == 0:
                result["is_open"] = True
                result["response_time_ms"] = round(response_time * 1000, 2)
            
            sock.close()
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def check_container(self, container_name):
        """
        Check if a Docker container is running.
        
        Args:
            container_name: Name of the container to check
            
        Returns:
            dict: Container status information
        """
        result = {
            "container_name": container_name,
            "is_running": False,
            "status": "unknown"
        }
        
        try:
            containers = self.docker_client.containers.list(all=True)
            
            # Find the container by name
            for container in containers:
                if container_name in container.name:
                    result["status"] = container.status
                    result["is_running"] = container.status == "running"
                    
                    # Get additional container stats if running
                    if result["is_running"]:
                        stats = container.stats(stream=False)
                        result["memory_usage"] = stats["memory_stats"].get("usage", 0)
                        result["cpu_percent"] = self._calculate_cpu_percent(stats)
                    
                    break
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def _calculate_cpu_percent(self, stats):
        """
        Calculate CPU usage percentage from Docker stats.
        
        Args:
            stats: Docker container stats
            
        Returns:
            float: CPU usage percentage
        """
        try:
            cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - stats["precpu_stats"]["cpu_usage"]["total_usage"]
            system_delta = stats["cpu_stats"]["system_cpu_usage"] - stats["precpu_stats"]["system_cpu_usage"]
            
            if system_delta > 0 and cpu_delta > 0:
                cpu_count = len(stats["cpu_stats"]["cpu_usage"]["percpu_usage"])
                return (cpu_delta / system_delta) * cpu_count * 100.0
            
            return 0.0
        except (KeyError, ZeroDivisionError):
            return 0.0
    
    def check_http_endpoint(self, url):
        """
        Check if an HTTP endpoint is reachable.
        
        Args:
            url: URL to check
            
        Returns:
            dict: HTTP endpoint status information
        """
        result = {
            "url": url,
            "is_reachable": False,
            "status_code": None,
            "response_time_ms": None
        }
        
        try:
            start_time = time.time()
            response = requests.get(url, timeout=5)
            response_time = time.time() - start_time
            
            result["status_code"] = response.status_code
            result["is_reachable"] = 200 <= response.status_code < 400
            result["response_time_ms"] = round(response_time * 1000, 2)
            
            # Try to parse response as JSON
            try:
                result["response_data"] = response.json()
            except:
                pass
            
        except requests.exceptions.RequestException as e:
            result["error"] = str(e)
        
        return result
    
    def check_system_resources(self):
        """
        Check system resource usage.
        
        Returns:
            dict: System resource information
        """
        result = {
            "cpu": {
                "percent": psutil.cpu_percent(interval=1),
                "count": psutil.cpu_count()
            },
            "memory": {
                "total": psutil.virtual_memory().total,
                "available": psutil.virtual_memory().available,
                "percent": psutil.virtual_memory().percent
            },
            "disk": {
                "total": psutil.disk_usage('/').total,
                "free": psutil.disk_usage('/').free,
                "percent": psutil.disk_usage('/').percent
            }
        }
        
        # Determine status based on resource usage
        result["status"] = "healthy"
        
        if result["cpu"]["percent"] > 90 or result["memory"]["percent"] > 90 or result["disk"]["percent"] > 90:
            result["status"] = "warning"
        
        if result["memory"]["available"] < 500 * 1024 * 1024:  # Less than 500MB available
            result["status"] = "critical"
        
        return result

# Create a singleton instance
health_check_service = HealthCheck()

# Example usage
if __name__ == "__main__":
    health_data = health_check_service.check_system_health()
    print(json.dumps(health_data, indent=2))
