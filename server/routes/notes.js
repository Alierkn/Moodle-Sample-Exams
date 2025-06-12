const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

// Get all public notes
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const notes = await db.collection('notes')
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes'
    });
  }
});

// Get user's notes (both public and private)
router.get('/user', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const notes = await db.collection('notes')
      .find({ userId: req.user.id.toString() })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error fetching user notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user notes'
    });
  }
});

// Get a specific note by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const note = await db.collection('notes').findOne({ 
      _id: new ObjectId(req.params.id)
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Check if note is private and user is not the owner
    if (!note.isPublic && (!req.user || note.userId !== req.user.id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch note'
    });
  }
});

// Create a new note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags, isPublic } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    const db = req.app.locals.db;
    
    const newNote = {
      title,
      content,
      tags: tags || [],
      isPublic: isPublic === true,
      userId: req.user.id.toString(),
      username: req.user.username,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      likedBy: []
    };
    
    const result = await db.collection('notes').insertOne(newNote);
    
    res.status(201).json({
      success: true,
      noteId: result.insertedId,
      note: {
        ...newNote,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
});

// Update a note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, tags, isPublic } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    const db = req.app.locals.db;
    
    // Check if note exists and user is the owner
    const note = await db.collection('notes').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    if (note.userId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own notes'
      });
    }
    
    const updatedNote = {
      title,
      content,
      tags: tags || note.tags,
      isPublic: isPublic === undefined ? note.isPublic : isPublic,
      updatedAt: new Date()
    };
    
    await db.collection('notes').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updatedNote }
    );
    
    res.json({
      success: true,
      message: 'Note updated successfully',
      note: {
        ...note,
        ...updatedNote
      }
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if note exists and user is the owner
    const note = await db.collection('notes').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    if (note.userId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own notes'
      });
    }
    
    await db.collection('notes').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
});

// Like/unlike a note
router.post('/:id/like', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const noteId = req.params.id;
    const userId = req.user.id.toString();
    
    // Check if note exists
    const note = await db.collection('notes').findOne({
      _id: new ObjectId(noteId)
    });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Check if user has already liked the note
    const hasLiked = note.likedBy && note.likedBy.includes(userId);
    
    if (hasLiked) {
      // Unlike the note
      await db.collection('notes').updateOne(
        { _id: new ObjectId(noteId) },
        { 
          $pull: { likedBy: userId },
          $inc: { likes: -1 }
        }
      );
      
      res.json({
        success: true,
        message: 'Note unliked successfully',
        liked: false
      });
    } else {
      // Like the note
      await db.collection('notes').updateOne(
        { _id: new ObjectId(noteId) },
        { 
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 }
        }
      );
      
      res.json({
        success: true,
        message: 'Note liked successfully',
        liked: true
      });
    }
  } catch (error) {
    console.error('Error liking/unliking note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike note'
    });
  }
});

// Search notes
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const db = req.app.locals.db;
    
    const notes = await db.collection('notes')
      .find({
        isPublic: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search notes'
    });
  }
});

module.exports = router;
