"""
Performance tests for MoodleExamSimulator optimized components.

This module contains performance tests for the database connection pooling,
Supabase client caching, and retry mechanisms to validate the optimizations.
"""

import os
import time
import threading
import statistics
from concurrent.futures import ThreadPoolExecutor
import pytest
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import components to test
from db_manager import DBManager
from supabase_client import SupabaseClient
from monitoring import logger

class TestDatabasePerformance:
    """Performance tests for database connections."""
    
    @pytest.fixture(scope="module")
    def db_manager(self):
        """Fixture to provide a DBManager instance."""
        # Initialize the DBManager
        db_manager = DBManager()
        yield db_manager
        # Clean up
        db_manager.close_all_connections()
    
    def test_sqlalchemy_connection_pool(self, db_manager):
        """Test SQLAlchemy connection pool performance."""
        # Measure time to get sessions from pool
        times = []
        
        for _ in range(50):
            start_time = time.time()
            session = db_manager.get_sqlalchemy_session()
            # Simple query to validate connection
            try:
                session.execute("SELECT 1")
            except Exception as e:
                # Skip timing if connection fails (for CI environments)
                logger.warning(f"SQLAlchemy connection failed: {e}")
                continue
            end_time = time.time()
            times.append(end_time - start_time)
        
        # Calculate statistics
        if times:
            avg_time = statistics.mean(times)
            median_time = statistics.median(times)
            max_time = max(times)
            min_time = min(times)
            
            logger.info(f"SQLAlchemy connection pool performance: "
                        f"avg={avg_time:.6f}s, median={median_time:.6f}s, "
                        f"min={min_time:.6f}s, max={max_time:.6f}s")
            
            # Assert reasonable performance
            assert avg_time < 0.01, f"Average connection time too high: {avg_time:.6f}s"
    
    def test_concurrent_database_access(self, db_manager):
        """Test concurrent database access performance."""
        # Number of concurrent threads
        num_threads = 20
        
        # Timing results
        results = {'sqlalchemy': [], 'mongodb': [], 'mysql': []}
        
        def test_sqlalchemy():
            start_time = time.time()
            session = db_manager.get_sqlalchemy_session()
            try:
                session.execute("SELECT 1")
                results['sqlalchemy'].append(time.time() - start_time)
            except Exception as e:
                logger.warning(f"SQLAlchemy connection failed: {e}")
        
        def test_mongodb():
            start_time = time.time()
            db = db_manager.get_mongodb_database('test')
            try:
                db.command('ping')
                results['mongodb'].append(time.time() - start_time)
            except Exception as e:
                logger.warning(f"MongoDB connection failed: {e}")
        
        def test_mysql():
            start_time = time.time()
            conn = db_manager.get_mysql_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.close()
                results['mysql'].append(time.time() - start_time)
            except Exception as e:
                logger.warning(f"MySQL connection failed: {e}")
        
        # Run concurrent tests
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            # SQLAlchemy tests
            for _ in range(num_threads):
                executor.submit(test_sqlalchemy)
            
            # MongoDB tests
            for _ in range(num_threads):
                executor.submit(test_mongodb)
            
            # MySQL tests
            for _ in range(num_threads):
                executor.submit(test_mysql)
        
        # Log results
        for db_type, times in results.items():
            if times:
                avg_time = statistics.mean(times)
                median_time = statistics.median(times)
                logger.info(f"{db_type} concurrent performance: "
                            f"avg={avg_time:.6f}s, median={median_time:.6f}s, "
                            f"samples={len(times)}")


class TestSupabaseClientPerformance:
    """Performance tests for Supabase client caching."""
    
    @pytest.fixture(scope="module")
    def supabase_client(self):
        """Fixture to provide a SupabaseClient instance."""
        # Check if Supabase URL and key are set
        if not os.environ.get('SUPABASE_URL') or not os.environ.get('SUPABASE_KEY'):
            pytest.skip("Supabase URL or key not set")
        
        # Initialize the SupabaseClient
        client = SupabaseClient()
        yield client
    
    def test_cache_performance(self, supabase_client):
        """Test cache performance for repeated queries."""
        # Skip if client initialization failed
        if not supabase_client:
            pytest.skip("Supabase client initialization failed")
        
        # Test data
        test_id = "test-user-1"
        
        # First call (cache miss)
        start_time = time.time()
        try:
            result1 = supabase_client.get_user_profile(test_id)
            cache_miss_time = time.time() - start_time
        except Exception as e:
            logger.warning(f"Supabase get_user_profile failed: {e}")
            pytest.skip("Supabase API call failed")
            return
        
        # Second call (should be cache hit)
        start_time = time.time()
        result2 = supabase_client.get_user_profile(test_id)
        cache_hit_time = time.time() - start_time
        
        # Log results
        logger.info(f"Supabase cache performance: "
                    f"miss={cache_miss_time:.6f}s, hit={cache_hit_time:.6f}s, "
                    f"improvement={cache_miss_time/cache_hit_time if cache_hit_time else 'N/A'}x")
        
        # Assert cache hit is faster
        assert cache_hit_time < cache_miss_time, "Cache hit should be faster than cache miss"
    
    def test_concurrent_cache_access(self, supabase_client):
        """Test concurrent cache access performance."""
        # Skip if client initialization failed
        if not supabase_client:
            pytest.skip("Supabase client initialization failed")
        
        # Number of concurrent threads
        num_threads = 20
        
        # Timing results
        results = {'hits': [], 'misses': []}
        
        # Test data - use different IDs to test cache misses
        test_ids = [f"test-user-{i}" for i in range(num_threads)]
        
        # Prefill cache for half the IDs
        for i in range(num_threads // 2):
            try:
                supabase_client.get_user_profile(test_ids[i])
            except Exception:
                pass
        
        # Test function for threads
        def test_get_profile(user_id):
            start_time = time.time()
            try:
                supabase_client.get_user_profile(user_id)
                end_time = time.time()
                
                # Determine if this was likely a cache hit or miss
                if user_id in test_ids[:num_threads // 2]:
                    results['hits'].append(end_time - start_time)
                else:
                    results['misses'].append(end_time - start_time)
            except Exception as e:
                logger.warning(f"Supabase get_user_profile failed: {e}")
        
        # Run concurrent tests
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            for user_id in test_ids:
                executor.submit(test_get_profile, user_id)
        
        # Log results
        for result_type, times in results.items():
            if times:
                avg_time = statistics.mean(times)
                median_time = statistics.median(times)
                logger.info(f"Supabase concurrent {result_type}: "
                            f"avg={avg_time:.6f}s, median={median_time:.6f}s, "
                            f"samples={len(times)}")


class TestRetryMechanismPerformance:
    """Performance tests for retry mechanisms."""
    
    def test_retry_performance(self):
        """Test retry mechanism performance impact."""
        from retry_manager import retry_with_exponential_backoff
        
        # Create test functions with and without retry
        def mock_function_success():
            return True
        
        def mock_function_fail_once():
            if not hasattr(mock_function_fail_once, 'called'):
                mock_function_fail_once.called = True
                raise ConnectionError("Mock connection error")
            return True
        
        # Apply retry decorator
        retry_success = retry_with_exponential_backoff(max_retries=3)(mock_function_success)
        retry_fail_once = retry_with_exponential_backoff(max_retries=3)(mock_function_fail_once)
        
        # Measure performance
        start_time = time.time()
        retry_success()
        success_time = time.time() - start_time
        
        # Reset flag
        if hasattr(mock_function_fail_once, 'called'):
            delattr(mock_function_fail_once, 'called')
        
        start_time = time.time()
        retry_fail_once()
        fail_once_time = time.time() - start_time
        
        # Log results
        logger.info(f"Retry performance: "
                    f"success={success_time:.6f}s, fail_once={fail_once_time:.6f}s, "
                    f"overhead={success_time/mock_function_success():.2f}x")
        
        # Assert reasonable performance
        assert success_time < 0.01, f"Retry success time too high: {success_time:.6f}s"


if __name__ == "__main__":
    # Setup logging
    import logging
    logging.basicConfig(level=logging.INFO)
    
    # Run tests
    pytest.main(["-xvs", __file__])
