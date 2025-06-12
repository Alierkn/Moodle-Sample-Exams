const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper functions to read/write JSON files
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
}

// Helper function to update user streak
function updateUserStreak(userId) {
  try {
    const users = readJsonFile(usersFilePath);
    const user = users.find(u => u.id === userId);
    
    if (!user) return false;
    
    const now = new Date();
    const lastActive = user.lastActive ? new Date(user.lastActive) : null;
    
    // Initialize streak if not present
    if (!user.streak) {
      user.streak = 1;
    } else {
      // Check if last activity was yesterday or today
      if (lastActive) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastActiveDate = new Date(lastActive).setHours(0, 0, 0, 0);
        const yesterdayDate = new Date(yesterday).setHours(0, 0, 0, 0);
        const todayDate = new Date(now).setHours(0, 0, 0, 0);
        
        if (lastActiveDate === yesterdayDate || lastActiveDate === todayDate) {
          // Increment streak only if today is different from last active day
          if (lastActiveDate !== todayDate) {
            user.streak += 1;
          }
        } else {
          // Reset streak if more than a day has passed
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }
    }
    
    // Update last active time
    user.lastActive = now.toISOString();
    
    // Save updated users
    return writeJsonFile(usersFilePath, users);
  } catch (error) {
    console.error('Error updating user streak:', error);
    return false;
  }
}

// File paths
const usersFilePath = path.join(dataDir, 'users.json');
const challengesFilePath = path.join(dataDir, 'challenges.json');
const resourcesFilePath = path.join(dataDir, 'resources.json');
const progressFilePath = path.join(dataDir, 'progress.json');

// Authentication middleware
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'moodle_exam_simulator_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Auth routes
app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Read users from file
    const users = readJsonFile(usersFilePath);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Compare passwords
    const isMatch = bcrypt.compareSync(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'moodle_exam_simulator_secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }
    
    // Read users from file
    const users = readJsonFile(usersFilePath);
    
    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role: 'student',
      createdAt: new Date().toISOString()
    };
    
    // Add user to file
    users.push(newUser);
    writeJsonFile(usersFilePath, users);
    
    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'moodle_exam_simulator_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/logout', (req, res) => {
  // In a file-based system, we don't need to do anything server-side
  // The client should remove the token from storage
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

app.get('/user/verify', auth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

app.post('/user/refresh-token', auth, (req, res) => {
  // Create a new token
  const token = jwt.sign(
    { id: req.user.id, username: req.user.username },
    process.env.JWT_SECRET || 'moodle_exam_simulator_secret',
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    token,
    message: 'Token refreshed successfully'
  });
});

// Resources endpoints
app.get('/resources', (req, res) => {
  try {
    const resources = readJsonFile(resourcesFilePath);
    res.json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources'
    });
  }
});

app.get('/resources/:id', (req, res) => {
  try {
    const resources = readJsonFile(resourcesFilePath);
    const resource = resources.find(r => r.id === req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource'
    });
  }
});

// Import code executor
const { executeCode, validateOutput } = require('./code-execution/executor');

// Code execution endpoint (real execution)
app.post('/run-code', auth, async (req, res) => {
  try {
    const { code, language, expectedOutput, input } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }
    
    // Execute the code
    const result = await executeCode(code, language, input);
    
    // Validate against expected output if provided
    if (expectedOutput && result.passed) {
      result.passed = validateOutput(result, expectedOutput);
    }
    
    res.json({
      success: true,
      output: result.output,
      executionTime: result.executionTime,
      passed: result.passed,
      error: result.error
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Challenges endpoints
app.get('/challenges', (req, res) => {
  try {
    const challenges = readJsonFile(challengesFilePath);
    res.json({
      success: true,
      challenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges'
    });
  }
});

app.get('/challenges/:id', (req, res) => {
  try {
    const challenges = readJsonFile(challengesFilePath);
    const challenge = challenges.find(c => c.id === req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    res.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge'
    });
  }
});

// Challenge progress endpoints
app.post('/challenges/:id/submit', auth, async (req, res) => {
  try {
    const { code, language } = req.body;
    const challengeId = req.params.id;
    
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }
    
    // Find the challenge
    const challenges = readJsonFile(challengesFilePath);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    // Execute the code
    const result = await executeCode(code, language);
    
    // Check if the output matches any of the test cases
    let allTestsPassed = true;
    const testResults = [];
    
    for (const testCase of challenge.testCases) {
      const testResult = await executeCode(
        code.replace('// Your code here', '').replace('/* Your code here */', ''),
        language,
        testCase.input
      );
      
      const expectedOutput = testCase.expected;
      const passed = validateOutput(testResult, expectedOutput);
      
      testResults.push({
        input: testCase.input,
        expected: expectedOutput,
        actual: testResult.output,
        passed
      });
      
      if (!passed) {
        allTestsPassed = false;
      }
    }
    
    // Update progress
    const progress = readJsonFile(progressFilePath);
    
    // Find existing progress for this user and challenge
    const existingProgress = progress.find(
      p => p.userId === req.user.id && p.challengeId === challengeId
    );
    
    const now = new Date().toISOString();
    
    if (existingProgress) {
      // Update existing progress
      existingProgress.attempts += 1;
      existingProgress.lastAttemptDate = now;
      existingProgress.code = code;
      existingProgress.executionTime = result.executionTime;
      existingProgress.testResults = testResults;
      
      if (allTestsPassed && !existingProgress.completed) {
        existingProgress.completed = true;
        existingProgress.score = challenge.points;
      }
    } else {
      // Create new progress entry
      progress.push({
        userId: req.user.id,
        challengeId,
        completed: allTestsPassed,
        score: allTestsPassed ? challenge.points : 0,
        attempts: 1,
        lastAttemptDate: now,
        code: code,
        executionTime: result.executionTime,
        testResults: testResults
      });
    }
    
    // Save progress
    writeJsonFile(progressFilePath, progress);
    
    // Update user score if all tests passed
    if (allTestsPassed) {
      const users = readJsonFile(usersFilePath);
      const user = users.find(u => u.id === req.user.id);
      
      if (user) {
        if (!user.points) {
          user.points = 0;
        }
        
        // Only add points if this is the first time completing the challenge
        if (!existingProgress || !existingProgress.completed) {
          user.points += challenge.points;
        }
        
        writeJsonFile(usersFilePath, users);
      }
      
      // Update user streak
      updateUserStreak(req.user.id);
    }
    
    res.json({
      success: true,
      allTestsPassed,
      testResults,
      executionTime: result.executionTime
    });
  } catch (error) {
    console.error('Error submitting challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit challenge'
    });
  }
});

// Get user progress for challenges
app.get('/user/progress', auth, (req, res) => {
  try {
    const progress = readJsonFile(progressFilePath);
    const userProgress = progress.filter(p => p.userId === req.user.id);
    
    // Get challenge details
    const challenges = readJsonFile(challengesFilePath);
    const users = readJsonFile(usersFilePath);
    const currentUser = users.find(u => u.id === req.user.id);
    
    // Get user stats
    const totalChallenges = challenges.length;
    const completedChallenges = userProgress.filter(p => p.completed).length;
    const totalPoints = userProgress.reduce((sum, p) => sum + (p.score || 0), 0);
    const completionRate = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;
    
    // Combine progress with challenge details
    const progressWithDetails = userProgress.map(p => {
      const challenge = challenges.find(c => c.id === p.challengeId) || {};
      return {
        ...p,
        title: challenge.title,
        difficulty: challenge.difficulty,
        category: challenge.category,
        language: challenge.language,
        description: challenge.description,
        maxPoints: challenge.points
      };
    });
    
    // Sort by last attempt date (most recent first)
    progressWithDetails.sort((a, b) => {
      return new Date(b.lastAttemptDate) - new Date(a.lastAttemptDate);
    });
    
    res.json({
      success: true,
      progress: progressWithDetails,
      stats: {
        totalChallenges,
        completedChallenges,
        totalPoints,
        completionRate: Math.round(completionRate),
        streak: currentUser?.streak || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user progress'
    });
  }
});

// Leaderboard endpoint
app.get('/leaderboard', (req, res) => {
  try {
    const users = readJsonFile(usersFilePath);
    const progress = readJsonFile(progressFilePath);
    
    // Calculate total points for each user
    const userPoints = {};
    const userChallenges = {};
    const userLastAttempt = {};
    
    progress.forEach(p => {
      if (p.completed) {
        if (!userPoints[p.userId]) {
          userPoints[p.userId] = 0;
          userChallenges[p.userId] = 0;
        }
        userPoints[p.userId] += p.score;
        userChallenges[p.userId] += 1;
        
        // Track the most recent attempt date
        const attemptDate = new Date(p.lastAttemptDate);
        if (!userLastAttempt[p.userId] || attemptDate > new Date(userLastAttempt[p.userId])) {
          userLastAttempt[p.userId] = p.lastAttemptDate;
        }
      }
    });
    
    // Create leaderboard
    const leaderboard = users
      .map(user => {
        // Use user's points from users.json if available, otherwise use calculated points
        const points = user.points !== undefined ? user.points : (userPoints[user.id] || 0);
        
        return {
          id: user.id,
          username: user.username,
          points: points,
          challengesCompleted: userChallenges[user.id] || 0,
          streak: user.streak || 0,
          lastAttemptDate: user.lastActive || userLastAttempt[user.id] || null
        };
      })
      .sort((a, b) => b.points - a.points || b.challengesCompleted - a.challengesCompleted)
      .slice(0, 10); // Top 10
    
    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
