"""
Supabase configuration for the Moodle Exam Simulator
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# Supabase configuration
# Use environment variables - no hardcoded defaults for security
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

# Check if required environment variables are set
if not SUPABASE_URL or not SUPABASE_KEY:
    import warnings
    warnings.warn(
        "SUPABASE_URL and SUPABASE_KEY must be set as environment variables. "
        "Please set these in your .env file or environment."
    )

# Supabase storage bucket names
DOCUMENTS_BUCKET = 'documents'
CHALLENGES_BUCKET = 'challenges'
USER_SOLUTIONS_BUCKET = 'user-solutions'

# Supabase table names
USERS_TABLE = 'users'
CHALLENGES_TABLE = 'challenges'
USER_CHALLENGES_TABLE = 'user_challenges'
RESOURCES_TABLE = 'resources'
