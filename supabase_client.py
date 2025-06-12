"""
Supabase client for the Moodle Exam Simulator
"""
from supabase import create_client, Client
import json
import os
import datetime
import time
import threading
from functools import wraps
from typing import Dict, List, Any, Optional, Union, Callable
from dotenv import load_dotenv

# Import monitoring, caching, and retry modules
from monitoring import logger, track_performance, api_performance_monitor, track_errors
from cache_manager import cached
from retry_manager import with_retry
from supabase_config import (
    SUPABASE_URL, 
    SUPABASE_KEY, 
    DOCUMENTS_BUCKET, 
    CHALLENGES_BUCKET,
    USER_SOLUTIONS_BUCKET,
    USERS_TABLE,
    CHALLENGES_TABLE,
    USER_CHALLENGES_TABLE,
    RESOURCES_TABLE
)

# Load environment variables
load_dotenv()

class SupabaseClient:
    """
    A client for interacting with Supabase with optimized connection handling and caching
    """
    _instance = None
    _lock = threading.Lock()
    _cache = {}
    _cache_ttl = {}
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SupabaseClient, cls).__new__(cls)
                cls._instance.supabase = None
                cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """
        Initialize the Supabase client with connection pooling
        """
        if self._initialized:
            return
            
        # Get configuration from environment variables or fallback to config file
        supabase_url = os.environ.get('SUPABASE_URL', SUPABASE_URL)
        supabase_key = os.environ.get('SUPABASE_KEY', SUPABASE_KEY)
        
        if self.supabase is None:
            self.supabase: Client = create_client(supabase_url, supabase_key)
            self._initialize_storage()
            self._cache_ttl_seconds = int(os.environ.get('CACHE_TTL', 300))  # Default 5 minutes cache TTL
            
            logger.info("Supabase client initialized", 
                       cache_ttl=self._cache_ttl_seconds)
            
        self._initialized = True
    
    @track_performance
    def _initialize_storage(self):
        """
        Initialize storage buckets if they don't exist
        """
        try:
            # Check if buckets exist and create them if they don't
            buckets = [DOCUMENTS_BUCKET, CHALLENGES_BUCKET, USER_SOLUTIONS_BUCKET]
            for bucket in buckets:
                try:
                    self.supabase.storage.get_bucket(bucket)
                    logger.debug(f"Storage bucket exists: {bucket}")
                except Exception:
                    self.supabase.storage.create_bucket(bucket)
                    logger.info(f"Created storage bucket: {bucket}")
            
            logger.info("Storage initialization complete", bucket_count=len(buckets))
        except Exception as e:
            logger.error(f"Error initializing storage: {str(e)}")
            raise
            
    # Use the retry_manager module instead of this custom implementation
    def retry_on_error(max_retries=3, delay=1):
        """
        Legacy decorator to retry operations on failure
        Now uses the retry_manager module internally
        """
        return with_retry(max_retries=max_retries, retry_delay=delay*1000)
        
    @track_performance
    def clear_cache(self):
        """
        Clear the cache
        """
        with self._lock:
            cache_size = len(self._cache)
            self._cache = {}
            self._cache_ttl = {}
            logger.info(f"Supabase cache cleared", items_cleared=cache_size)
    
    # User management
    @track_performance
    @api_performance_monitor('register_user')
    @with_retry(max_retries=3, retry_delay=1000)
    def register_user(self, email: str, password: str, username: str) -> Dict[str, Any]:
        """
        Register a new user with Supabase Auth and store additional user data
        """
        try:
            # Register user with Supabase Auth
            auth_response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
            })
            
            # Store additional user data in the users table
            user_id = auth_response.user.id
            user_data = {
                "id": user_id,
                "username": username,
                "email": email,
                "points": 0,
                "streak": 0,
                "created_at": "now()",
            }
            
            self.supabase.table(USERS_TABLE).insert(user_data).execute()
            
            return {
                "success": True,
                "user": {
                    "id": user_id,
                    "username": username,
                    "email": email
                }
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @track_performance
    @api_performance_monitor('login_user')
    @with_retry(max_retries=3, retry_delay=1000)
    def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """
        Login a user with Supabase Auth
        """
        try:
            # Login user with Supabase Auth
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            # Get user data from the users table
            user_id = auth_response.user.id
            user_data = self.supabase.table(USERS_TABLE).select("*").eq("id", user_id).execute()
            
            if len(user_data.data) == 0:
                return {"success": False, "error": "User not found"}
            
            # Update last login
            self.supabase.table(USERS_TABLE).update({"last_login": "now()"}).eq("id", user_id).execute()
            
            return {
                "success": True,
                "user": user_data.data[0],
                "session": auth_response.session
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @track_performance
    @cached(ttl=300)  # Cache user data for 5 minutes
    @with_retry(max_retries=3, retry_delay=1000)
    def get_user(self, user_id: str) -> Dict[str, Any]:
        """
        Get user data from the users table
        """
        try:
            user_data = self.supabase.table(USERS_TABLE).select("*").eq("id", user_id).execute()
            
            if len(user_data.data) == 0:
                return {"success": False, "error": "User not found"}
            
            return {
                "success": True,
                "user": user_data.data[0]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @track_performance
    @cached(ttl=60)  # Cache profile for 1 minute as it changes frequently
    @with_retry(max_retries=3, retry_delay=1000)
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get enhanced user profile with statistics and recent activities
        """
        try:
            # Get basic user data
            user_result = self.get_user(user_id)
            if not user_result["success"]:
                return user_result
                
            user_data = user_result["user"]
            
            # Get user challenges with challenge details
            challenges_query = f"""
            SELECT uc.*, c.title, c.language, c.points, c.difficulty 
            FROM {USER_CHALLENGES_TABLE} uc 
            JOIN {CHALLENGES_TABLE} c ON uc.challenge_id = c.id 
            WHERE uc.user_id = '{user_id}' 
            ORDER BY uc.completed_at DESC
            """
            
            challenges = self.supabase.rpc('select_user_challenges_with_details', {"user_id_param": user_id}).execute()
            
            # If RPC function doesn't exist, fall back to regular query
            if not challenges.data:
                challenges = self.supabase.table(USER_CHALLENGES_TABLE)\
                    .select(f"*, {CHALLENGES_TABLE}(title, language, points, difficulty)")\
                    .eq("user_id", user_id)\
                    .order("completed_at", desc=True)\
                    .execute()
            
            user_challenges = challenges.data if challenges.data else []
            
            # Process challenges for statistics
            total_challenges = len(user_challenges)
            completed_challenges = sum(1 for c in user_challenges if c.get("completed_at"))
            
            # Group by language
            challenges_by_language = {}
            for challenge in user_challenges:
                # Get language from challenge or nested challenge data
                language = challenge.get("language")
                if not language and challenge.get(CHALLENGES_TABLE):
                    language = challenge[CHALLENGES_TABLE].get("language")
                language = language or "Unknown"
                
                if language not in challenges_by_language:
                    challenges_by_language[language] = {"total": 0, "completed": 0}
                
                challenges_by_language[language]["total"] += 1
                if challenge.get("completed_at"):
                    challenges_by_language[language]["completed"] += 1
            
            # Format recent activities
            recent_activities = []
            for challenge in user_challenges[:10]:  # Get top 10 recent activities
                challenge_data = challenge.get(CHALLENGES_TABLE, {})
                activity = {
                    "title": challenge_data.get("title") if challenge_data else challenge.get("title"),
                    "language": challenge_data.get("language") if challenge_data else challenge.get("language"),
                    "points": challenge_data.get("points") if challenge_data else challenge.get("points"),
                    "completed_at": challenge.get("completed_at"),
                    "challenge_id": challenge.get("challenge_id"),
                    "execution_time": challenge.get("execution_time")
                }
                recent_activities.append(activity)
            
            # Combine all data
            enhanced_profile = {
                **user_data,
                "statistics": {
                    "total_challenges": total_challenges,
                    "completed_challenges": completed_challenges,
                    "challenges_by_language": challenges_by_language
                },
                "recent_activities": recent_activities
            }
            
            return {"success": True, "user": enhanced_profile}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Document management
    @track_performance
    @api_performance_monitor('upload_document')
    @with_retry(max_retries=5, retry_delay=2000)  # More retries for uploads
    def upload_document(self, file_path: str, file_name: str, user_id: str) -> Dict[str, Any]:
        """
        Upload a document to Supabase Storage
        """
        try:
            with open(file_path, "rb") as f:
                file_content = f.read()
            
            # Upload file to storage
            storage_path = f"{user_id}/{file_name}"
            self.supabase.storage.from_(DOCUMENTS_BUCKET).upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": "application/octet-stream"}
            )
            
            # Get public URL
            file_url = self.supabase.storage.from_(DOCUMENTS_BUCKET).get_public_url(storage_path)
            
            return {
                "success": True,
                "file_url": file_url,
                "storage_path": storage_path
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @track_performance
    @cached(ttl=3600)  # Cache documents for 1 hour
    @with_retry(max_retries=3, retry_delay=1000)
    def get_document(self, storage_path: str) -> Dict[str, Any]:
        """
        Get a document from Supabase Storage
        """
        try:
            # Get public URL
            file_url = self.supabase.storage.from_(DOCUMENTS_BUCKET).get_public_url(storage_path)
            
            return {
                "success": True,
                "file_url": file_url
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @track_performance
    @cached(ttl=300)  # Cache document list for 5 minutes
    @with_retry(max_retries=3, retry_delay=1000)
    def list_documents(self, user_id: str) -> Dict[str, Any]:
        """
        List all documents for a user
        """
        try:
            files = self.supabase.storage.from_(DOCUMENTS_BUCKET).list(user_id)
            
            documents = []
            for file in files:
                file_url = self.supabase.storage.from_(DOCUMENTS_BUCKET).get_public_url(f"{user_id}/{file['name']}")
                documents.append({
                    "name": file["name"],
                    "url": file_url,
                    "size": file["metadata"]["size"],
                    "created_at": file["metadata"]["created_at"]
                })
            
            return {
                "success": True,
                "documents": documents
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Challenge management
    @track_performance
    @api_performance_monitor('create_challenge')
    @with_retry(max_retries=3, retry_delay=1000)
    def create_challenge(self, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new challenge
        """
        try:
            result = self.supabase.table(CHALLENGES_TABLE).insert(challenge_data).execute()
            
            return {
                "success": True,
                "challenge": result.data[0]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @track_performance
    @cached(ttl=300)  # Cache challenges for 5 minutes
    @with_retry(max_retries=3, retry_delay=1000)
    def get_challenges(self) -> Dict[str, Any]:
        """
        Get all challenges with caching
        """
        try:
            result = self.supabase.table(CHALLENGES_TABLE).select("*").execute()
            
            # No need to manually update cache anymore
            
            return {
                "success": True,
                "challenges": result.data,
                "cached": False
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @track_performance
    @cached(ttl=300)  # Cache individual challenges for 5 minutes
    @with_retry(max_retries=3, retry_delay=1000)
    def get_challenge(self, challenge_id: str) -> Dict[str, Any]:
        """
        Get a challenge by ID
        """
        try:
            result = self.supabase.table(CHALLENGES_TABLE).select("*").eq("id", challenge_id).execute()
            
            if len(result.data) == 0:
                return {"success": False, "error": "Challenge not found"}
            
            return {
                "success": True,
                "challenge": result.data[0]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # User challenge management
    @track_performance
    @api_performance_monitor('submit_challenge_solution')
    @with_retry(max_retries=3, retry_delay=1000)
    def submit_challenge_solution(self, user_id: str, challenge_id: str, solution: str, execution_time: float) -> Dict[str, Any]:
        """
        Submit a solution for a challenge
        """
        try:
            # Store the solution in the user_challenges table
            solution_data = {
                "user_id": user_id,
                "challenge_id": challenge_id,
                "solution": solution,
                "execution_time": execution_time,
                "completed_at": "now()"
            }
            
            result = self.supabase.table(USER_CHALLENGES_TABLE).insert(solution_data).execute()
            
            # Update user points
            challenge = self.get_challenge(challenge_id)
            if challenge["success"]:
                points = challenge["challenge"].get("points", 10)
                self.supabase.table(USERS_TABLE).update({
                    "points": self.supabase.table(USERS_TABLE).select("points").eq("id", user_id).single().execute().data["points"] + points
                }).eq("id", user_id).execute()
            
            return {
                "success": True,
                "submission": result.data[0]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @track_performance
    @cached(ttl=60)  # Cache user challenges for 1 minute
    @with_retry(max_retries=3, retry_delay=1000)
    def get_user_challenges(self, user_id: str) -> Dict[str, Any]:
        """
        Get all challenges completed by a user
        """
        try:
            result = self.supabase.table(USER_CHALLENGES_TABLE).select("*").eq("user_id", user_id).execute()
            
            return {
                "success": True,
                "user_challenges": result.data
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Resource management
    @track_performance
    @api_performance_monitor('create_resource')
    @with_retry(max_retries=3, retry_delay=1000)
    def create_resource(self, resource_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new resource
        """
        try:
            result = self.supabase.table(RESOURCES_TABLE).insert(resource_data).execute()
            
            return {
                "success": True,
                "resource": result.data[0]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @track_performance
    @cached(ttl=600)  # Cache resources for 10 minutes
    @with_retry(max_retries=3, retry_delay=1000)
    def get_resources(self) -> Dict[str, Any]:
        """
        Get all resources
        """
        try:
            result = self.supabase.table(RESOURCES_TABLE).select("*").execute()
            
            return {
                "success": True,
                "resources": result.data
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
