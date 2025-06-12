"""
Monitoring and Logging Module for MoodleExamSimulator

This module provides comprehensive monitoring, logging, and performance tracking
capabilities for the MoodleExamSimulator system.
"""

import time
import functools
import logging
import os
import json
from datetime import datetime
import structlog
from pyformance import MetricsRegistry
from pyformance.reporters import ConsoleReporter
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# Set up basic logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('moodle_simulator.log')
    ]
)

# Set up structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

# Create a structured logger
logger = structlog.get_logger()

# Set up metrics registry
metrics = MetricsRegistry()
reporter = ConsoleReporter(registry=metrics)

# Start reporting metrics every minute
reporter.start(period=60)

class PerformanceMonitor:
    """Performance monitoring for the application."""
    
    @staticmethod
    def track_performance(func):
        """
        Decorator to track the performance of a function.
        
        Args:
            func: The function to be tracked
            
        Returns:
            The wrapped function with performance tracking
        """
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Get function name and module for the metric
            func_name = func.__name__
            module_name = func.__module__
            metric_name = f"{module_name}.{func_name}"
            
            # Get timer from registry
            timer = metrics.timer(metric_name)
            
            # Start timing
            start_time = time.time()
            context = {
                'function': func_name,
                'module': module_name,
                'start_time': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Starting execution of {func_name}", **context)
            
            # Execute the function within the timer context
            with timer.time():
                try:
                    result = func(*args, **kwargs)
                    # Record success
                    metrics.meter(f"{metric_name}.success").mark()
                    
                    # Log completion
                    execution_time = time.time() - start_time
                    context['execution_time_ms'] = round(execution_time * 1000, 2)
                    logger.info(f"Completed execution of {func_name}", **context)
                    
                    return result
                except Exception as e:
                    # Record failure
                    metrics.meter(f"{metric_name}.failure").mark()
                    
                    # Log error
                    execution_time = time.time() - start_time
                    context['execution_time_ms'] = round(execution_time * 1000, 2)
                    context['error'] = str(e)
                    logger.error(f"Error in execution of {func_name}", **context)
                    
                    # Re-raise the exception
                    raise
        
        return wrapper

    @staticmethod
    def api_performance_monitor(endpoint_name):
        """
        Decorator to monitor API endpoint performance.
        
        Args:
            endpoint_name: Name of the API endpoint
            
        Returns:
            Decorator function
        """
        def decorator(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                # Start timing
                start_time = time.time()
                
                # Create context for logging
                context = {
                    'endpoint': endpoint_name,
                    'method': kwargs.get('method', 'GET'),
                    'start_time': datetime.utcnow().isoformat()
                }
                
                logger.info(f"API request to {endpoint_name}", **context)
                
                # Get histogram from registry
                histogram = metrics.histogram(f"api.{endpoint_name}.response_time")
                
                try:
                    # Execute the function
                    result = func(*args, **kwargs)
                    
                    # Record response time
                    response_time = time.time() - start_time
                    histogram.add(response_time)
                    
                    # Record success
                    metrics.meter(f"api.{endpoint_name}.success").mark()
                    
                    # Update context and log completion
                    context['status_code'] = getattr(result, 'status_code', 200)
                    context['response_time_ms'] = round(response_time * 1000, 2)
                    logger.info(f"API response from {endpoint_name}", **context)
                    
                    return result
                except Exception as e:
                    # Record failure
                    metrics.meter(f"api.{endpoint_name}.failure").mark()
                    
                    # Update context and log error
                    response_time = time.time() - start_time
                    context['error'] = str(e)
                    context['response_time_ms'] = round(response_time * 1000, 2)
                    logger.error(f"API error in {endpoint_name}", **context)
                    
                    # Re-raise the exception
                    raise
            
            return wrapper
        
        return decorator

class EventTracker:
    """Track user and system events."""
    
    @staticmethod
    def track_event(event_type, user_id=None):
        """
        Decorator to track events in the system.
        
        Args:
            event_type: Type of event (e.g., 'login', 'submission', 'challenge_completed')
            user_id: Optional user ID for user-specific events
            
        Returns:
            Decorator function
        """
        def decorator(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                # Execute the function first
                result = func(*args, **kwargs)
                
                # Extract user_id from kwargs if not provided
                actual_user_id = user_id
                if actual_user_id is None and 'user_id' in kwargs:
                    actual_user_id = kwargs['user_id']
                
                # Create event context
                event_context = {
                    'event_type': event_type,
                    'timestamp': datetime.utcnow().isoformat(),
                    'function': func.__name__,
                    'module': func.__module__
                }
                
                # Add user_id if available
                if actual_user_id:
                    event_context['user_id'] = actual_user_id
                
                # Log the event
                logger.info(f"Event: {event_type}", **event_context)
                
                # Increment event counter
                metrics.meter(f"events.{event_type}").mark()
                
                return result
            
            return wrapper
        
        return decorator

    @staticmethod
    def log_user_activity(user_id, activity_type, details=None):
        """
        Log user activity directly (not as a decorator).
        
        Args:
            user_id: User ID
            activity_type: Type of activity
            details: Additional details about the activity
        """
        context = {
            'user_id': user_id,
            'activity_type': activity_type,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if details:
            context['details'] = details
        
        logger.info(f"User activity: {activity_type}", **context)
        metrics.meter(f"user_activity.{activity_type}").mark()

class ErrorTracker:
    """Track and handle errors in the system."""
    
    @staticmethod
    def track_errors(func):
        """
        Decorator to track errors in functions.
        
        Args:
            func: The function to track errors for
            
        Returns:
            The wrapped function with error tracking
        """
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                # Create error context
                error_context = {
                    'function': func.__name__,
                    'module': func.__module__,
                    'error_type': type(e).__name__,
                    'error_message': str(e),
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                # Log the error
                logger.error(f"Error in {func.__name__}", **error_context)
                
                # Increment error counter
                metrics.meter(f"errors.{type(e).__name__}").mark()
                
                # Re-raise the exception
                raise
        
        return wrapper
    
    @staticmethod
    def log_error(error, context=None):
        """
        Log an error directly (not as a decorator).
        
        Args:
            error: The error object or message
            context: Additional context about the error
        """
        error_context = {
            'timestamp': datetime.utcnow().isoformat(),
            'error_type': type(error).__name__ if isinstance(error, Exception) else 'string',
            'error_message': str(error)
        }
        
        if context:
            error_context.update(context)
        
        logger.error("Error occurred", **error_context)
        metrics.meter(f"errors.{error_context['error_type']}").mark()

# Export decorators for easy import
track_performance = PerformanceMonitor.track_performance
api_performance_monitor = PerformanceMonitor.api_performance_monitor
track_event = EventTracker.track_event
track_errors = ErrorTracker.track_errors

# Example usage:
if __name__ == "__main__":
    # Example of using the performance monitor
    @track_performance
    def example_function(a, b):
        time.sleep(0.5)  # Simulate work
        return a + b
    
    # Example of using the API performance monitor
    @api_performance_monitor("example_endpoint")
    def example_api_endpoint():
        time.sleep(0.3)  # Simulate API work
        return "API Response"
    
    # Example of using the event tracker
    @track_event("example_event", user_id="user123")
    def user_action():
        time.sleep(0.2)  # Simulate user action
        return "Action completed"
    
    # Example of using the error tracker
    @track_errors
    def function_with_error():
        raise ValueError("Example error")
    
    # Run examples
    print(example_function(1, 2))
    print(example_api_endpoint())
    print(user_action())
    
    # Log a user activity directly
    EventTracker.log_user_activity("user123", "login", {"ip": "192.168.1.1"})
    
    # Log an error directly
    try:
        function_with_error()
    except Exception as e:
        ErrorTracker.log_error(e, {"additional": "context"})
    
    # Wait for metrics to be reported
    print("Waiting for metrics report...")
    time.sleep(2)
