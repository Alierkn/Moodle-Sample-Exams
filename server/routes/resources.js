const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const resourcesDir = path.join(uploadsDir, 'resources');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resourcesDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept pdf, images, and common code file extensions
  const allowedFileTypes = [
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.md',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.svg',
    // Code files
    '.py', '.js', '.html', '.css', '.java', '.c', '.cpp', '.cs', 
    '.php', '.rb', '.go', '.ts', '.sql', '.json', '.xml'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    return cb(null, true);
  }
  
  cb(new Error('Invalid file type. Only PDF, images, and code files are allowed.'));
};

// Configure upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter
});

// Get all resources
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const resources = await db.collection('resources').find({}).toArray();
    
    res.json({
      success: true,
      resources: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources'
    });
  }
});

// Upload a new resource
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, type, author } = req.body;
    const file = req.file;
    
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }
    
    // For link type, we expect the URL in the request body
    let url = '';
    if (type === 'link') {
      url = req.body.file;
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required for link resources'
        });
      }
    } else {
      // For file uploads, we need the file
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }
      url = `/uploads/resources/${file.filename}`;
    }
    
    const db = req.app.locals.db;
    
    // Create new resource document
    const newResource = {
      id: uuidv4(),
      title,
      description,
      category,
      type,
      author: author || req.user.username,
      url,
      date: new Date(),
      uploadedBy: req.user.id
    };
    
    await db.collection('resources').insertOne(newResource);
    
    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      resource: newResource
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resource'
    });
  }
});

// Get user favorites
router.get('/user/favorites', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({ _id: req.user.id });
    
    res.json({
      success: true,
      favorites: user.favorites || []
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites'
    });
  }
});

// Toggle favorite
router.post('/user/favorites/toggle', auth, async (req, res) => {
  try {
    const { resource_id } = req.body;
    
    if (!resource_id) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required'
      });
    }
    
    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({ _id: req.user.id });
    
    let favorites = user.favorites || [];
    let message = '';
    
    if (favorites.includes(resource_id)) {
      // Remove from favorites
      favorites = favorites.filter(id => id !== resource_id);
      message = 'Resource removed from favorites';
    } else {
      // Add to favorites
      favorites.push(resource_id);
      message = 'Resource added to favorites';
    }
    
    await db.collection('users').updateOne(
      { _id: req.user.id },
      { $set: { favorites: favorites } }
    );
    
    res.json({
      success: true,
      message,
      favorites
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorites'
    });
  }
});

// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
