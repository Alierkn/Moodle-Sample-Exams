"""
Seed data script for Moodle Exam Simulator
This script populates the database with sample challenges, resources, and users
"""

import os
import sys
import datetime
import json
from werkzeug.security import generate_password_hash

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the app and models
from web_api import app
from models import db, User, Challenge, UserChallenge, Resource

def seed_database():
    """Seed the database with sample data"""
    with app.app_context():
        print("Seeding database...")
        
        # Create sample users
        users = [
            {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "password123",
                "points": 2450,
                "streak": 7
            },
            {
                "username": "emma_smith",
                "email": "emma@example.com",
                "password": "password123",
                "points": 2280,
                "streak": 5
            },
            {
                "username": "michael_brown",
                "email": "michael@example.com",
                "password": "password123",
                "points": 2100,
                "streak": 3
            },
            {
                "username": "sarah_jones",
                "email": "sarah@example.com",
                "password": "password123",
                "points": 1950,
                "streak": 4
            },
            {
                "username": "david_wilson",
                "email": "david@example.com",
                "password": "password123",
                "points": 1800,
                "streak": 2
            }
        ]
        
        for user_data in users:
            # Check if user already exists
            existing_user = User.query.filter_by(username=user_data["username"]).first()
            if existing_user:
                print(f"User {user_data['username']} already exists, skipping...")
                continue
                
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                points=user_data["points"],
                streak=user_data["streak"]
            )
            user.password_hash = generate_password_hash(user_data["password"])
            user.created_at = datetime.datetime.utcnow()
            user.last_activity = datetime.datetime.utcnow()
            db.session.add(user)
        
        # Create sample challenges
        challenges = [
            {
                "title": "Python: Fibonacci Sequence",
                "description": "Write a function that returns the nth Fibonacci number. The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the two preceding ones.",
                "difficulty": "Easy",
                "language": "python",
                "points": 100,
                "initial_code": "def fibonacci(n):\n    # Your code here\n    pass\n\n# Example usage:\n# fibonacci(6) should return 8",
                "expected_output": "8",
                "test_cases": json.dumps([
                    {"input": "fibonacci(0)", "expected": "0"},
                    {"input": "fibonacci(1)", "expected": "1"},
                    {"input": "fibonacci(6)", "expected": "8"},
                    {"input": "fibonacci(10)", "expected": "55"}
                ])
            },
            {
                "title": "Neo4j: Social Network Analysis",
                "description": "Write a Cypher query to find the 5 people with the most connections in a social network graph.",
                "difficulty": "Medium",
                "language": "neo4j",
                "points": 200,
                "initial_code": "// Your Cypher query here\n// Example data model: (Person)-[:FOLLOWS]->(Person)",
                "expected_output": None,
                "test_cases": None
            },
            {
                "title": "MongoDB: Aggregation Pipeline",
                "description": "Write a MongoDB aggregation pipeline to group products by category and calculate the total sales for each category.",
                "difficulty": "Hard",
                "language": "mongodb",
                "points": 300,
                "initial_code": "// Your MongoDB aggregation pipeline\n// Example collection: products with fields: name, category, price, quantity_sold",
                "expected_output": None,
                "test_cases": None
            },
            {
                "title": "SQL: JOIN Operations",
                "description": "Write a SQL query to join the 'orders', 'customers', and 'products' tables to find the top 5 customers by total order value.",
                "difficulty": "Medium",
                "language": "sql",
                "points": 250,
                "initial_code": "-- Your SQL query here\n-- Tables: orders(id, customer_id, product_id, quantity, order_date)\n--         customers(id, name, email, country)\n--         products(id, name, price, category)",
                "expected_output": None,
                "test_cases": None
            },
            {
                "title": "Python: Palindrome Checker",
                "description": "Write a function that checks if a given string is a palindrome (reads the same forwards and backwards), ignoring spaces, punctuation, and case.",
                "difficulty": "Easy",
                "language": "python",
                "points": 150,
                "initial_code": "def is_palindrome(text):\n    # Your code here\n    pass\n\n# Example usage:\n# is_palindrome('A man, a plan, a canal: Panama') should return True",
                "expected_output": "True",
                "test_cases": json.dumps([
                    {"input": "is_palindrome('racecar')", "expected": "True"},
                    {"input": "is_palindrome('hello')", "expected": "False"},
                    {"input": "is_palindrome('A man, a plan, a canal: Panama')", "expected": "True"},
                    {"input": "is_palindrome('Was it a car or a cat I saw?')", "expected": "True"}
                ])
            }
        ]
        
        for challenge_data in challenges:
            # Check if challenge already exists
            existing_challenge = Challenge.query.filter_by(title=challenge_data["title"]).first()
            if existing_challenge:
                print(f"Challenge '{challenge_data['title']}' already exists, skipping...")
                continue
                
            challenge = Challenge(
                title=challenge_data["title"],
                description=challenge_data["description"],
                difficulty=challenge_data["difficulty"],
                language=challenge_data["language"],
                points=challenge_data["points"],
                initial_code=challenge_data["initial_code"],
                expected_output=challenge_data["expected_output"],
                test_cases=challenge_data["test_cases"]
            )
            db.session.add(challenge)
        
        # Create sample resources
        resources = [
            {
                "title": "Python Programming Guide",
                "description": "Comprehensive guide to Python programming with examples and exercises.",
                "category": "Lecture Notes",
                "url": "https://docs.python.org/3/tutorial/"
            },
            {
                "title": "SQL Cheat Sheet",
                "description": "Quick reference for common SQL commands and syntax.",
                "category": "Cheat Sheets",
                "url": "https://www.sqltutorial.org/sql-cheat-sheet/"
            },
            {
                "title": "MongoDB Documentation",
                "description": "Official MongoDB documentation with tutorials and reference guides.",
                "category": "Documentation",
                "url": "https://docs.mongodb.com/"
            },
            {
                "title": "Neo4j Cypher Query Language",
                "description": "Guide to Neo4j's Cypher query language with examples.",
                "category": "Documentation",
                "url": "https://neo4j.com/developer/cypher/"
            },
            {
                "title": "Database Design Principles",
                "description": "Lecture notes on database design principles and best practices.",
                "category": "Lecture Notes",
                "url": "#"
            },
            {
                "title": "Previous Year Exam Questions",
                "description": "Collection of exam questions from previous years with solutions.",
                "category": "Past Exams",
                "url": "#"
            }
        ]
        
        for resource_data in resources:
            # Check if resource already exists
            existing_resource = Resource.query.filter_by(title=resource_data["title"]).first()
            if existing_resource:
                print(f"Resource '{resource_data['title']}' already exists, skipping...")
                continue
                
            resource = Resource(
                title=resource_data["title"],
                description=resource_data["description"],
                category=resource_data["category"],
                url=resource_data["url"]
            )
            db.session.add(resource)
        
        # Commit all changes
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
