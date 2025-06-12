from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    last_login = db.Column(db.DateTime)
    points = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    last_activity = db.Column(db.DateTime)
    
    # Relationships
    solved_challenges = db.relationship('UserChallenge', back_populates='user')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def update_streak(self):
        now = datetime.datetime.utcnow()
        if self.last_activity:
            # If last activity was yesterday, increment streak
            yesterday = now - datetime.timedelta(days=1)
            if yesterday.date() == self.last_activity.date():
                self.streak += 1
            # If last activity was more than 1 day ago, reset streak
            elif (now - self.last_activity).days > 1:
                self.streak = 1
        else:
            # First activity
            self.streak = 1
        self.last_activity = now
    
    def add_points(self, points):
        self.points += points
        
    def __repr__(self):
        return f'<User {self.username}>'


class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)  # Easy, Medium, Hard
    language = db.Column(db.String(20), nullable=False)    # Python, SQL, Neo4j, MongoDB
    points = db.Column(db.Integer, default=10)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Initial code template
    initial_code = db.Column(db.Text)
    
    # Expected output or test cases
    expected_output = db.Column(db.Text)
    test_cases = db.Column(db.Text)  # JSON string of test cases
    
    # Relationships
    solved_by = db.relationship('UserChallenge', back_populates='challenge')
    
    def __repr__(self):
        return f'<Challenge {self.title}>'


class UserChallenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenge.id'), nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    solution = db.Column(db.Text)
    execution_time = db.Column(db.Float)  # in seconds
    
    # Relationships
    user = db.relationship('User', back_populates='solved_challenges')
    challenge = db.relationship('Challenge', back_populates='solved_by')
    
    def __repr__(self):
        return f'<UserChallenge {self.user.username} - {self.challenge.title}>'


class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)  # Lecture Notes, Past Exams, etc.
    file_path = db.Column(db.String(255))
    url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f'<Resource {self.title}>'
