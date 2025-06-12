"""
Retry Manager for MoodleExamSimulator

This module provides retry functionality to improve reliability
when interacting with external services like databases and APIs.
"""

import time
import functools
import random
import os
from typing import Any, Callable, Dict, List, Optional, Type, Union
from dotenv import load_dotenv

# Import monitoring module
from monitoring import logger, track_performance

# Load environment variables
load_dotenv()

class RetryError(Exception):
    """Exception raised when all retry attempts fail."""
    
    def __init__(self, original_exception: Exception, attempts: int):
        """
        Initialize a retry error.
        
        Args:
            original_exception: The original exception that caused the retry failure
            attempts: Number of retry attempts made
        """
        self.original_exception = original_exception
        self.attempts = attempts
        message = f"Failed after {attempts} attempts. Original error: {str(original_exception)}"
        super().__init__(message)

class RetryManager:
    """
    Retry manager for handling transient failures when interacting with external services.
    Implements exponential backoff with jitter for more efficient retries.
    """
    
    def __init__(
        self,
        max_retries: Optional[int] = None,
        retry_delay: Optional[int] = None,
        max_delay: Optional[int] = None,
        backoff_factor: float = 2.0,
        jitter: bool = True,
        retry_exceptions: Optional[List[Type[Exception]]] = None
    ):
        """
        Initialize the retry manager.
        
        Args:
            max_retries: Maximum number of retry attempts
            retry_delay: Initial delay between retries in milliseconds
            max_delay: Maximum delay between retries in milliseconds
            backoff_factor: Factor to increase delay with each retry
            jitter: Whether to add randomness to the delay
            retry_exceptions: List of exception types to retry on
        """
        self.max_retries = max_retries if max_retries is not None else int(os.environ.get('MAX_RETRIES', 3))
        self.retry_delay = retry_delay if retry_delay is not None else int(os.environ.get('RETRY_DELAY', 1000))
        self.max_delay = max_delay if max_delay is not None else int(os.environ.get('MAX_DELAY', 30000))
        self.backoff_factor = backoff_factor
        self.jitter = jitter
        
        # Default to retry on common transient errors
        self.retry_exceptions = retry_exceptions or [
            ConnectionError,
            TimeoutError,
            OSError,
            IOError
        ]
        
        logger.info("Retry manager initialized", 
                   max_retries=self.max_retries, 
                   retry_delay=self.retry_delay,
                   max_delay=self.max_delay)
    
    @track_performance
    def retry(
        self,
        func: Callable,
        *args,
        max_retries: Optional[int] = None,
        retry_delay: Optional[int] = None,
        retry_exceptions: Optional[List[Type[Exception]]] = None,
        **kwargs
    ) -> Any:
        """
        Execute a function with retry logic.
        
        Args:
            func: Function to execute
            *args: Arguments to pass to the function
            max_retries: Override default max retries
            retry_delay: Override default retry delay
            retry_exceptions: Override default retry exceptions
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            Result of the function
            
        Raises:
            RetryError: If all retry attempts fail
        """
        attempts = 0
        actual_max_retries = max_retries if max_retries is not None else self.max_retries
        actual_retry_delay = retry_delay if retry_delay is not None else self.retry_delay
        actual_retry_exceptions = retry_exceptions if retry_exceptions is not None else self.retry_exceptions
        
        last_exception = None
        
        while attempts <= actual_max_retries:
            try:
                if attempts > 0:
                    logger.info(f"Retry attempt {attempts}/{actual_max_retries} for {func.__name__}")
                
                return func(*args, **kwargs)
                
            except Exception as e:
                last_exception = e
                
                # Check if exception is in retry_exceptions
                if not any(isinstance(e, exc_type) for exc_type in actual_retry_exceptions):
                    logger.warning(f"Non-retryable exception in {func.__name__}: {str(e)}")
                    raise
                
                attempts += 1
                
                if attempts > actual_max_retries:
                    logger.error(f"Max retries ({actual_max_retries}) exceeded for {func.__name__}")
                    break
                
                # Calculate delay with exponential backoff
                delay_ms = min(
                    actual_retry_delay * (self.backoff_factor ** (attempts - 1)),
                    self.max_delay
                )
                
                # Add jitter if enabled (±20% randomness)
                if self.jitter:
                    jitter_factor = 1 + random.uniform(-0.2, 0.2)
                    delay_ms *= jitter_factor
                
                delay_sec = delay_ms / 1000.0
                
                logger.info(f"Retrying {func.__name__} in {delay_sec:.2f}s after error: {str(e)}")
                time.sleep(delay_sec)
        
        # If we get here, all retries failed
        raise RetryError(last_exception, attempts)

def with_retry(
    max_retries: Optional[int] = None,
    retry_delay: Optional[int] = None,
    retry_exceptions: Optional[List[Type[Exception]]] = None
):
    """
    Decorator for adding retry logic to functions.
    
    Args:
        max_retries: Maximum number of retry attempts
        retry_delay: Initial delay between retries in milliseconds
        retry_exceptions: List of exception types to retry on
        
    Returns:
        Decorated function with retry logic
    """
    retry_manager = RetryManager(
        max_retries=max_retries,
        retry_delay=retry_delay,
        retry_exceptions=retry_exceptions
    )
    
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return retry_manager.retry(
                func,
                *args,
                max_retries=max_retries,
                retry_delay=retry_delay,
                retry_exceptions=retry_exceptions,
                **kwargs
            )
        
        return wrapper
    
    return decorator

# Create a default retry manager instance
retry_manager = RetryManager()

# Example usage
if __name__ == "__main__":
    # Example of using the retry manager directly
    def unstable_operation():
        if random.random() < 0.7:  # 70% chance of failure
            raise ConnectionError("Simulated connection error")
        return "Success!"
    
    try:
        result = retry_manager.retry(unstable_operation)
        print(f"Result: {result}")
    except RetryError as e:
        print(f"Failed after retries: {e}")
    
    # Example of using the retry decorator
    @with_retry(max_retries=5, retry_delay=500)
    def another_unstable_operation(param):
        if random.random() < 0.5:  # 50% chance of failure
            raise TimeoutError("Simulated timeout")
        return f"Success with {param}!"
    
    try:
        result = another_unstable_operation("test")
        print(f"Result: {result}")
    except RetryError as e:
        print(f"Failed after retries: {e}")
