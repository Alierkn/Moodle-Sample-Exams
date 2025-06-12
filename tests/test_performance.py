"""
Unit tests for the MoodleExamSimulator performance optimization components.

This module tests the cache and retry mechanisms to ensure they function correctly.
"""

import os
import sys
import time
import pytest
from unittest.mock import patch, MagicMock, call

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import cache and retry modules
from cache_manager import CacheManager, cached
from retry_manager import RetryManager, with_retry, RetryError

class TestCacheManager:
    """Tests for the cache manager."""
    
    def test_singleton_pattern(self):
        """Test that CacheManager is a singleton."""
        cache1 = CacheManager()
        cache2 = CacheManager()
        assert cache1 is cache2
    
    def test_set_get(self):
        """Test basic set and get operations."""
        cache = CacheManager()
        cache.clear()  # Start with a clean cache
        
        # Set a value
        cache.set("test_key", "test_value")
        
        # Get the value
        value = cache.get("test_key")
        assert value == "test_value"
    
    def test_ttl_expiration(self):
        """Test that items expire after TTL."""
        cache = CacheManager()
        cache.clear()
        
        # Set a value with a short TTL
        cache.set("short_lived", "expires_soon", ttl=1)
        
        # Value should be available immediately
        assert cache.get("short_lived") == "expires_soon"
        
        # Wait for expiration
        time.sleep(1.1)
        
        # Value should be None after expiration
        assert cache.get("short_lived") is None
    
    def test_delete(self):
        """Test deleting items from cache."""
        cache = CacheManager()
        cache.clear()
        
        # Set a value
        cache.set("delete_me", "value")
        
        # Delete the value
        result = cache.delete("delete_me")
        assert result is True
        
        # Value should be None after deletion
        assert cache.get("delete_me") is None
        
        # Deleting non-existent key should return False
        result = cache.delete("nonexistent")
        assert result is False
    
    def test_clear(self):
        """Test clearing the entire cache."""
        cache = CacheManager()
        
        # Set multiple values
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        # Clear the cache
        cache.clear()
        
        # All values should be None
        assert cache.get("key1") is None
        assert cache.get("key2") is None
    
    def test_cached_decorator(self):
        """Test the cached decorator."""
        # Create a mock function with the cached decorator
        mock_func = MagicMock(return_value="result")
        decorated_func = cached(ttl=60)(mock_func)
        
        # First call should execute the function
        result1 = decorated_func("arg1", "arg2", kwarg="kwvalue")
        assert result1 == "result"
        mock_func.assert_called_once_with("arg1", "arg2", kwarg="kwvalue")
        
        # Reset the mock
        mock_func.reset_mock()
        
        # Second call with same args should use cache
        result2 = decorated_func("arg1", "arg2", kwarg="kwvalue")
        assert result2 == "result"
        mock_func.assert_not_called()
        
        # Call with different args should execute the function again
        result3 = decorated_func("different", "args")
        assert result3 == "result"
        mock_func.assert_called_once_with("different", "args")

class TestRetryManager:
    """Tests for the retry manager."""
    
    def test_successful_execution(self):
        """Test successful execution without retries."""
        retry_manager = RetryManager()
        
        # Mock function that succeeds
        mock_func = MagicMock(return_value="success")
        
        # Execute with retry
        result = retry_manager.retry(mock_func, "arg1", kwarg="value")
        
        # Function should be called once and return the result
        assert result == "success"
        mock_func.assert_called_once_with("arg1", kwarg="value")
    
    def test_retry_success_after_failures(self):
        """Test successful execution after some failures."""
        retry_manager = RetryManager(max_retries=3, retry_delay=10, jitter=False)
        
        # Mock function that fails twice then succeeds
        mock_func = MagicMock(side_effect=[
            ConnectionError("First failure"),
            ConnectionError("Second failure"),
            "success"
        ])
        
        # Execute with retry
        with patch('time.sleep') as mock_sleep:
            result = retry_manager.retry(mock_func)
        
        # Function should be called three times and return success
        assert result == "success"
        assert mock_func.call_count == 3
        
        # Sleep should be called twice (after first and second failures)
        assert mock_sleep.call_count == 2
    
    def test_retry_exhaustion(self):
        """Test retry exhaustion when all attempts fail."""
        retry_manager = RetryManager(max_retries=2, retry_delay=10, jitter=False)
        
        # Mock function that always fails
        mock_func = MagicMock(side_effect=ConnectionError("Always fails"))
        
        # Execute with retry should raise RetryError
        with patch('time.sleep'), pytest.raises(RetryError) as exc_info:
            retry_manager.retry(mock_func)
        
        # Function should be called three times (initial + 2 retries)
        assert mock_func.call_count == 3
        
        # RetryError should contain the original exception
        assert isinstance(exc_info.value.original_exception, ConnectionError)
        assert exc_info.value.attempts == 3
    
    def test_non_retryable_exception(self):
        """Test that non-retryable exceptions are raised immediately."""
        retry_manager = RetryManager(retry_exceptions=[ConnectionError])
        
        # Mock function that raises a non-retryable exception
        mock_func = MagicMock(side_effect=ValueError("Non-retryable"))
        
        # Execute with retry should raise ValueError immediately
        with pytest.raises(ValueError):
            retry_manager.retry(mock_func)
        
        # Function should be called only once
        mock_func.assert_called_once()
    
    def test_with_retry_decorator(self):
        """Test the with_retry decorator."""
        # Create a mock function with the retry decorator
        mock_func = MagicMock(side_effect=[
            ConnectionError("First failure"),
            "success"
        ])
        
        decorated_func = with_retry(max_retries=3, retry_delay=10)(mock_func)
        
        # Execute decorated function
        with patch('time.sleep'):
            result = decorated_func("arg1", kwarg="value")
        
        # Function should be called twice and return success
        assert result == "success"
        assert mock_func.call_count == 2
        assert mock_func.call_args_list == [
            call("arg1", kwarg="value"),
            call("arg1", kwarg="value")
        ]
    
    def test_exponential_backoff(self):
        """Test exponential backoff in retry delays."""
        retry_manager = RetryManager(
            max_retries=3,
            retry_delay=100,  # 100ms initial delay
            backoff_factor=2.0,
            jitter=False
        )
        
        # Mock function that always fails
        mock_func = MagicMock(side_effect=ConnectionError("Always fails"))
        
        # Execute with retry
        with patch('time.sleep') as mock_sleep, pytest.raises(RetryError):
            retry_manager.retry(mock_func)
        
        # Sleep should be called with increasing delays
        assert mock_sleep.call_count == 3
        assert mock_sleep.call_args_list[0][0][0] == 0.1  # 100ms
        assert mock_sleep.call_args_list[1][0][0] == 0.2  # 200ms
        assert mock_sleep.call_args_list[2][0][0] == 0.4  # 400ms

if __name__ == '__main__':
    pytest.main(['-v', __file__])
