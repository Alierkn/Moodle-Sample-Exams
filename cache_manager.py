"""
Cache Manager for MoodleExamSimulator

This module provides caching functionality to improve performance
by storing frequently accessed data in memory.
"""

import time
import threading
import json
import functools
import hashlib
import os
from typing import Any, Dict, Optional, Callable, Tuple
from dotenv import load_dotenv

# Import monitoring module
from monitoring import logger, track_performance

# Load environment variables
load_dotenv()

class CacheItem:
    """Container for cached items with expiration."""
    
    def __init__(self, value: Any, ttl: int):
        """
        Initialize a cache item.
        
        Args:
            value: The value to cache
            ttl: Time to live in seconds
        """
        self.value = value
        self.expiry = time.time() + ttl
    
    def is_expired(self) -> bool:
        """Check if the cache item has expired."""
        return time.time() > self.expiry

class CacheManager:
    """
    Cache manager for storing frequently accessed data.
    Implements a simple in-memory cache with TTL (time to live).
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Singleton pattern to ensure only one cache instance exists."""
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(CacheManager, cls).__new__(cls)
                cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize the cache manager."""
        if self._initialized:
            return
            
        self._cache: Dict[str, CacheItem] = {}
        self._lock = threading.Lock()
        self._default_ttl = int(os.environ.get('CACHE_TTL', 3600))  # Default 1 hour
        self._cleanup_thread = None
        self._running = False
        
        # Start cleanup thread
        self._start_cleanup_thread()
        
        self._initialized = True
        logger.info("Cache manager initialized", default_ttl=self._default_ttl)
    
    def _start_cleanup_thread(self):
        """Start a background thread to clean up expired cache items."""
        self._running = True
        self._cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self._cleanup_thread.start()
    
    def _cleanup_loop(self):
        """Periodically clean up expired cache items."""
        while self._running:
            time.sleep(60)  # Check every minute
            self.cleanup()
    
    def stop(self):
        """Stop the cleanup thread."""
        self._running = False
        if self._cleanup_thread:
            self._cleanup_thread.join(timeout=1)
    
    @track_performance
    def cleanup(self):
        """Remove expired items from the cache."""
        with self._lock:
            expired_keys = [k for k, v in self._cache.items() if v.is_expired()]
            for key in expired_keys:
                del self._cache[key]
            
            if expired_keys:
                logger.info(f"Removed {len(expired_keys)} expired items from cache")
    
    @track_performance
    def get(self, key: str) -> Optional[Any]:
        """
        Get a value from the cache.
        
        Args:
            key: Cache key
            
        Returns:
            The cached value or None if not found or expired
        """
        with self._lock:
            if key in self._cache:
                item = self._cache[key]
                if item.is_expired():
                    del self._cache[key]
                    logger.debug(f"Cache miss (expired): {key}")
                    return None
                logger.debug(f"Cache hit: {key}")
                return item.value
            
            logger.debug(f"Cache miss: {key}")
            return None
    
    @track_performance
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set a value in the cache.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (uses default if None)
        """
        if ttl is None:
            ttl = self._default_ttl
            
        with self._lock:
            self._cache[key] = CacheItem(value, ttl)
            logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
    
    @track_performance
    def delete(self, key: str) -> bool:
        """
        Delete a value from the cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if the key was found and deleted, False otherwise
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                logger.debug(f"Cache delete: {key}")
                return True
            return False
    
    @track_performance
    def clear(self) -> None:
        """Clear all items from the cache."""
        with self._lock:
            count = len(self._cache)
            self._cache.clear()
            logger.info(f"Cache cleared ({count} items)")
    
    @track_performance
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dict with cache statistics
        """
        with self._lock:
            total_items = len(self._cache)
            expired_items = sum(1 for item in self._cache.values() if item.is_expired())
            
            return {
                "total_items": total_items,
                "expired_items": expired_items,
                "active_items": total_items - expired_items,
                "default_ttl": self._default_ttl
            }

def cached(ttl: Optional[int] = None, key_func: Optional[Callable] = None):
    """
    Decorator for caching function results.
    
    Args:
        ttl: Time to live in seconds (uses default if None)
        key_func: Optional function to generate cache key from function arguments
        
    Returns:
        Decorated function with caching
    """
    cache_manager = CacheManager()
    
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation based on function name and arguments
                key_parts = [func.__module__, func.__name__]
                
                # Add args to key
                for arg in args:
                    try:
                        key_parts.append(str(arg))
                    except:
                        key_parts.append(type(arg).__name__)
                
                # Add kwargs to key (sorted for consistency)
                for k, v in sorted(kwargs.items()):
                    try:
                        key_parts.append(f"{k}:{v}")
                    except:
                        key_parts.append(f"{k}:{type(v).__name__}")
                
                # Create a hash of the key parts
                key_string = ":".join(key_parts)
                cache_key = hashlib.md5(key_string.encode()).hexdigest()
            
            # Try to get from cache
            cached_value = cache_manager.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Not in cache, call the function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache_manager.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    
    return decorator

# Create a singleton instance
cache_manager = CacheManager()

# Example usage
if __name__ == "__main__":
    # Example of using the cache decorator
    @cached(ttl=60)
    def expensive_operation(a, b):
        print("Performing expensive operation...")
        time.sleep(2)  # Simulate expensive operation
        return a + b
    
    # First call will execute the function
    print(expensive_operation(1, 2))
    
    # Second call will use cached result
    print(expensive_operation(1, 2))
    
    # Different arguments will execute the function again
    print(expensive_operation(3, 4))
    
    # Get cache stats
    print(cache_manager.get_stats())
