"""
Supabase configuration for the Moodle Exam Simulator
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# Supabase configuration
# Use environment variables for deployment
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://ewcgbvxodoegekesqggi.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Y2didnhvZG9lZ2VrZXNxZ2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTg0NDIsImV4cCI6MjA2NTI5NDQ0Mn0.AhIU_qp-dcaxddPFuZLSp9CTxyI83njjCi9GWSjsHow')

# Supabase storage bucket names
DOCUMENTS_BUCKET = 'documents'
CHALLENGES_BUCKET = 'challenges'
USER_SOLUTIONS_BUCKET = 'user-solutions'

# Supabase table names
USERS_TABLE = 'users'
CHALLENGES_TABLE = 'challenges'
USER_CHALLENGES_TABLE = 'user_challenges'
RESOURCES_TABLE = 'resources'
