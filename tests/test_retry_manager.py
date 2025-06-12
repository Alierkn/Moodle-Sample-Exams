"""
Tests for the Retry Manager module.

This module contains unit tests for the RetryManager class and retry decorators,
testing retry logic, exponential backoff, and exception handling.
"""

import os
import time
import unittest
from unittest.mock import patch, MagicMock, call
import pytest

# Import the module to test
from retry_manager import RetryManager, RetryError, with_retry, retry_manager

class TestRetryManager(unittest.TestCase):
    """Test cases for the RetryManager class."""

    def setUp(self):
        """Set up test fixtures."""
        # Save original environment variables
        self.original_env = os.environ.copy()
        
        # Set test environment variables
        os.environ['MAX_RETRIES'] = '3'
        os.environ['RETRY_DELAY'] = '100'
        os.environ['MAX_DELAY'] = '5000'

    def tearDown(self):
        """Tear down test fixtures."""
        # Restore original environment variables
        os.environ.clear()
        os.environ.update(self.original_env)

    def test_init_with_defaults(self):
        """Test initialization with default values."""
        manager = RetryManager()
        
        # Verify default values from environment variables
        self.assertEqual(manager.max_retries, 3)
        self.assertEqual(manager.retry_delay, 100)
        self.assertEqual(manager.max_delay, 5000)
        self.assertEqual(manager.backoff_factor, 2.0)
        self.assertTrue(manager.jitter)
        
        # Verify default retry exceptions
        self.assertIn(ConnectionError, manager.retry_exceptions)
        self.assertIn(TimeoutError, manager.retry_exceptions)
        self.assertIn(OSError, manager.retry_exceptions)
        self.assertIn(IOError, manager.retry_exceptions)

    def test_init_with_custom_values(self):
        """Test initialization with custom values."""
        manager = RetryManager(
            max_retries=5,
            retry_delay=200,
            max_delay=10000,
            backoff_factor=3.0,
            jitter=False,
            retry_exceptions=[ValueError, KeyError]
        )
        
        # Verify custom values
        self.assertEqual(manager.max_retries, 5)
        self.assertEqual(manager.retry_delay, 200)
        self.assertEqual(manager.max_delay, 10000)
        self.assertEqual(manager.backoff_factor, 3.0)
        self.assertFalse(manager.jitter)
        
        # Verify custom retry exceptions
        self.assertIn(ValueError, manager.retry_exceptions)
        self.assertIn(KeyError, manager.retry_exceptions)
        self.assertNotIn(ConnectionError, manager.retry_exceptions)

    @patch('retry_manager.time.sleep')
    def test_successful_execution(self, mock_sleep):
        """Test successful execution without retries."""
        # Create a mock function that always succeeds
        mock_func = MagicMock(return_value="success")
        
        # Create RetryManager
        manager = RetryManager()
        
        # Execute the function with retry
        result = manager.retry(mock_func, "arg1", kwarg1="value1")
        
        # Verify the result
        self.assertEqual(result, "success")
        
        # Verify the function was called once
        mock_func.assert_called_once_with("arg1", kwarg1="value1")
        
        # Verify sleep was not called
        mock_sleep.assert_not_called()

    @patch('retry_manager.time.sleep')
    def test_retry_on_exception(self, mock_sleep):
        """Test retry on exception."""
        # Create a mock function that fails twice then succeeds
        mock_func = MagicMock(side_effect=[
            ConnectionError("First failure"),
            ConnectionError("Second failure"),
            "success"
        ])
        
        # Create RetryManager
        manager = RetryManager(max_retries=3, retry_delay=100, jitter=False)
        
        # Execute the function with retry
        result = manager.retry(mock_func)
        
        # Verify the result
        self.assertEqual(result, "success")
        
        # Verify the function was called three times
        self.assertEqual(mock_func.call_count, 3)
        
        # Verify sleep was called twice with correct delays
        mock_sleep.assert_has_calls([
            call(0.1),  # 100ms
            call(0.2)   # 200ms (backoff factor of 2)
        ])

    @patch('retry_manager.time.sleep')
    def test_max_retries_exceeded(self, mock_sleep):
        """Test exception when max retries are exceeded."""
        # Create a mock function that always fails
        original_error = ConnectionError("Always fails")
        mock_func = MagicMock(side_effect=original_error)
        
        # Create RetryManager
        manager = RetryManager(max_retries=2, retry_delay=100, jitter=False)
        
        # Execute the function with retry and expect RetryError
        with self.assertRaises(RetryError) as context:
            manager.retry(mock_func)
        
        # Verify the RetryError contains the original exception
        self.assertIs(context.exception.original_exception, original_error)
        self.assertEqual(context.exception.attempts, 3)  # Initial + 2 retries
        
        # Verify the function was called three times
        self.assertEqual(mock_func.call_count, 3)
        
        # Verify sleep was called twice with correct delays
        mock_sleep.assert_has_calls([
            call(0.1),  # 100ms
            call(0.2)   # 200ms (backoff factor of 2)
        ])

    @patch('retry_manager.time.sleep')
    def test_non_retryable_exception(self, mock_sleep):
        """Test that non-retryable exceptions are not retried."""
        # Create a mock function that raises a non-retryable exception
        original_error = ValueError("Non-retryable")
        mock_func = MagicMock(side_effect=original_error)
        
        # Create RetryManager
        manager = RetryManager()
        
        # Execute the function with retry and expect the original exception
        with self.assertRaises(ValueError) as context:
            manager.retry(mock_func)
        
        # Verify the function was called only once
        mock_func.assert_called_once()
        
        # Verify sleep was not called
        mock_sleep.assert_not_called()

    @patch('retry_manager.time.sleep')
    def test_custom_retry_exceptions(self, mock_sleep):
        """Test retry with custom exception types."""
        # Create a mock function that raises a custom exception
        original_error = KeyError("Custom exception")
        mock_func = MagicMock(side_effect=[original_error, "success"])
        
        # Create RetryManager with custom retry exceptions
        manager = RetryManager(retry_exceptions=[KeyError])
        
        # Execute the function with retry
        result = manager.retry(mock_func)
        
        # Verify the result
        self.assertEqual(result, "success")
        
        # Verify the function was called twice
        self.assertEqual(mock_func.call_count, 2)
        
        # Verify sleep was called once
        mock_sleep.assert_called_once()

    @patch('retry_manager.time.sleep')
    def test_max_delay(self, mock_sleep):
        """Test that delay is capped at max_delay."""
        # Create a mock function that fails multiple times
        mock_func = MagicMock(side_effect=[
            ConnectionError("Failure 1"),
            ConnectionError("Failure 2"),
            ConnectionError("Failure 3"),
            ConnectionError("Failure 4"),
            "success"
        ])
        
        # Create RetryManager with small max_delay
        manager = RetryManager(
            max_retries=5,
            retry_delay=100,
            max_delay=300,
            backoff_factor=2.0,
            jitter=False
        )
        
        # Execute the function with retry
        result = manager.retry(mock_func)
        
        # Verify the result
        self.assertEqual(result, "success")
        
        # Verify sleep was called with correct delays
        # 100ms, 200ms, 300ms, 300ms (capped)
        mock_sleep.assert_has_calls([
            call(0.1),
            call(0.2),
            call(0.3),
            call(0.3)
        ])

    @patch('retry_manager.time.sleep')
    def test_with_retry_decorator(self, mock_sleep):
        """Test the with_retry decorator."""
        # Create a mock function
        mock_func = MagicMock(side_effect=[ConnectionError("Failure"), "success"])
        
        # Apply the decorator
        decorated_func = with_retry(max_retries=2, retry_delay=100)(mock_func)
        
        # Call the decorated function
        result = decorated_func("arg1", kwarg1="value1")
        
        # Verify the result
        self.assertEqual(result, "success")
        
        # Verify the function was called twice
        self.assertEqual(mock_func.call_count, 2)
        mock_func.assert_has_calls([
            call("arg1", kwarg1="value1"),
            call("arg1", kwarg1="value1")
        ])
        
        # Verify sleep was called once
        mock_sleep.assert_called_once()

    @patch('retry_manager.random.uniform')
    @patch('retry_manager.time.sleep')
    def test_jitter(self, mock_sleep, mock_uniform):
        """Test that jitter adds randomness to the delay."""
        # Set up random to return a specific value
        mock_uniform.return_value = 0.1  # 10% increase
        
        # Create a mock function that fails once then succeeds
        mock_func = MagicMock(side_effect=[ConnectionError("Failure"), "success"])
        
        # Create RetryManager with jitter
        manager = RetryManager(retry_delay=100, jitter=True)
        
        # Execute the function with retry
        result = manager.retry(mock_func)
        
        # Verify the result
        self.assertEqual(result, "success")
        
        # Verify uniform was called to generate jitter
        mock_uniform.assert_called_once_with(-0.2, 0.2)
        
        # Verify sleep was called with jittered delay (100ms * 1.1 = 110ms)
        mock_sleep.assert_called_once_with(0.11)

    def test_retry_error_message(self):
        """Test the RetryError message format."""
        original_exception = ConnectionError("Original error")
        error = RetryError(original_exception, 3)
        
        # Verify the error message
        self.assertIn("Failed after 3 attempts", str(error))
        self.assertIn("Original error: Original error", str(error))

if __name__ == '__main__':
    unittest.main()
