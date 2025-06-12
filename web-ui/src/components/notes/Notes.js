import React, { useState, useEffect } from 'react';
import { Search, Plus, ThumbsUp, Edit, Trash, Heart, MessageCircle, Filter, X } from 'lucide-react';
import apiService from '../../services/api';
import NoteForm from './NoteForm';
import NoteDetail from './NoteDetail';

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [userNotes, setUserNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'my', 'favorites'
  const [filterTag, setFilterTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  // Fetch notes on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all public notes
        const publicNotesResponse = await apiService.getNotes();
        
        if (publicNotesResponse.success) {
          setNotes(publicNotesResponse.notes);
          
          // Extract all unique tags
          const tags = new Set();
          publicNotesResponse.notes.forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
              note.tags.forEach(tag => tags.add(tag));
            }
          });
          setAllTags(Array.from(tags));
        }
        
        // Fetch user's notes if logged in
        if (user) {
          const userNotesResponse = await apiService.getUserNotes();
          if (userNotesResponse.success) {
            setUserNotes(userNotesResponse.notes);
          }
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to load notes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [user]);

  // Handle note creation
  const handleCreateNote = async (noteData) => {
    try {
      const response = await apiService.createNote(noteData);
      
      if (response.success) {
        // Add new note to the list
        if (noteData.isPublic) {
          setNotes(prevNotes => [response.note, ...prevNotes]);
        }
        
        setUserNotes(prevNotes => [response.note, ...prevNotes]);
        setShowForm(false);
        
        // Update tags list
        if (noteData.tags && Array.isArray(noteData.tags)) {
          const newTags = new Set([...allTags]);
          noteData.tags.forEach(tag => newTags.add(tag));
          setAllTags(Array.from(newTags));
        }
      } else {
        setError(response.message || 'Failed to create note');
      }
    } catch (err) {
      console.error('Error creating note:', err);
      setError('An error occurred while creating the note');
    }
  };

  // Handle note update
  const handleUpdateNote = async (noteId, noteData) => {
    try {
      const response = await apiService.updateNote(noteId, noteData);
      
      if (response.success) {
        // Update note in the lists
        const updatedNote = response.note;
        
        setNotes(prevNotes => 
          prevNotes.map(note => note._id === noteId ? updatedNote : note)
        );
        
        setUserNotes(prevNotes => 
          prevNotes.map(note => note._id === noteId ? updatedNote : note)
        );
        
        setSelectedNote(null);
        
        // Update tags list
        if (noteData.tags && Array.isArray(noteData.tags)) {
          const newTags = new Set([...allTags]);
          noteData.tags.forEach(tag => newTags.add(tag));
          setAllTags(Array.from(newTags));
        }
      } else {
        setError(response.message || 'Failed to update note');
      }
    } catch (err) {
      console.error('Error updating note:', err);
      setError('An error occurred while updating the note');
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      const response = await apiService.deleteNote(noteId);
      
      if (response.success) {
        // Remove note from the lists
        setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
        setUserNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
        setSelectedNote(null);
      } else {
        setError(response.message || 'Failed to delete note');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('An error occurred while deleting the note');
    }
  };

  // Handle note like/unlike
  const handleToggleLike = async (noteId) => {
    if (!user) {
      setError('You must be logged in to like notes');
      return;
    }
    
    try {
      const response = await apiService.toggleNoteLike(noteId);
      
      if (response.success) {
        // Update like status in both lists
        const updateNoteLikes = (notesList) => {
          return notesList.map(note => {
            if (note._id === noteId) {
              const userId = user.id.toString();
              const likedBy = note.likedBy || [];
              
              if (response.liked) {
                return {
                  ...note,
                  likes: (note.likes || 0) + 1,
                  likedBy: [...likedBy, userId]
                };
              } else {
                return {
                  ...note,
                  likes: Math.max((note.likes || 0) - 1, 0),
                  likedBy: likedBy.filter(id => id !== userId)
                };
              }
            }
            return note;
          });
        };
        
        setNotes(updateNoteLikes(notes));
        setUserNotes(updateNoteLikes(userNotes));
        
        // Update selected note if it's the one being liked
        if (selectedNote && selectedNote._id === noteId) {
          setSelectedNote(prev => {
            const userId = user.id.toString();
            const likedBy = prev.likedBy || [];
            
            if (response.liked) {
              return {
                ...prev,
                likes: (prev.likes || 0) + 1,
                likedBy: [...likedBy, userId]
              };
            } else {
              return {
                ...prev,
                likes: Math.max((prev.likes || 0) - 1, 0),
                likedBy: likedBy.filter(id => id !== userId)
              };
            }
          });
        }
      } else {
        setError(response.message || 'Failed to like/unlike note');
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('An error occurred while liking/unliking the note');
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // If search term is empty, reset to default view
      const fetchNotes = async () => {
        setLoading(true);
        
        try {
          const publicNotesResponse = await apiService.getNotes();
          if (publicNotesResponse.success) {
            setNotes(publicNotesResponse.notes);
          }
        } catch (err) {
          console.error('Error fetching notes:', err);
          setError('Failed to load notes');
        } finally {
          setLoading(false);
        }
      };
      
      fetchNotes();
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiService.searchNotes(searchTerm);
      
      if (response.success) {
        setNotes(response.notes);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (err) {
      console.error('Error searching notes:', err);
      setError('An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  // Filter notes based on current view mode and filter tag
  const getFilteredNotes = () => {
    let filteredNotes = [];
    
    switch (viewMode) {
      case 'my':
        filteredNotes = userNotes;
        break;
      case 'favorites':
        filteredNotes = notes.filter(note => {
          return note.likedBy && note.likedBy.includes(user?.id.toString());
        });
        break;
      case 'all':
      default:
        filteredNotes = notes;
    }
    
    // Apply tag filter if set
    if (filterTag) {
      filteredNotes = filteredNotes.filter(note => 
        note.tags && Array.isArray(note.tags) && note.tags.includes(filterTag)
      );
    }
    
    return filteredNotes;
  };

  // Check if user has liked a note
  const hasUserLikedNote = (note) => {
    return user && note.likedBy && note.likedBy.includes(user.id.toString());
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Notes</h1>
        
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 px-6 py-4 rounded-lg mb-6">
            <p>{error}</p>
            <button 
              className="text-red-300 hover:text-red-100 text-sm mt-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center w-full md:w-auto">
            <div className="relative flex-grow md:max-w-md">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-gray-800 text-white px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-0 top-0 h-full px-4 bg-blue-600 rounded-r-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <div className="relative">
              <button
                onClick={() => setFilterTag('')}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
                  filterTag ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                <Filter size={16} />
                <span>{filterTag || 'All Tags'}</span>
                {filterTag && (
                  <X size={14} className="ml-1 hover:text-red-300" />
                )}
              </button>
              
              {filterTag && (
                <div className="absolute top-10 right-0 bg-gray-800 rounded-lg shadow-lg z-10 p-2 w-48">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-700 rounded"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg ${
                viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
              }`}
            >
              All
            </button>
            
            {user && (
              <>
                <button
                  onClick={() => setViewMode('my')}
                  className={`px-3 py-1 rounded-lg ${
                    viewMode === 'my' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  My Notes
                </button>
                
                <button
                  onClick={() => setViewMode('favorites')}
                  className={`px-3 py-1 rounded-lg ${
                    viewMode === 'favorites' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  Favorites
                </button>
              </>
            )}
            
            {user && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setSelectedNote(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus size={18} className="mr-1" /> New Note
              </button>
            )}
          </div>
        </div>
        
        {/* Note form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-2xl">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedNote ? 'Edit Note' : 'Create New Note'}
                </h2>
                <NoteForm 
                  initialData={selectedNote}
                  onSubmit={selectedNote 
                    ? (data) => handleUpdateNote(selectedNote._id, data)
                    : handleCreateNote
                  }
                  onCancel={() => {
                    setShowForm(false);
                    setSelectedNote(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Note detail modal */}
        {selectedNote && !showForm && (
          <NoteDetail
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onEdit={() => {
              if (user && selectedNote.userId === user.id.toString()) {
                setShowForm(true);
              }
            }}
            onDelete={() => {
              if (user && selectedNote.userId === user.id.toString()) {
                handleDeleteNote(selectedNote._id);
              }
            }}
            onLike={() => handleToggleLike(selectedNote._id)}
            isLiked={hasUserLikedNote(selectedNote)}
            isOwner={user && selectedNote.userId === user.id.toString()}
            currentUser={user}
          />
        )}
        
        {/* Notes grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : getFilteredNotes().length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No notes found</h3>
            <p className="text-gray-400">
              {viewMode === 'my' 
                ? "You haven't created any notes yet." 
                : viewMode === 'favorites'
                ? "You haven't favorited any notes yet."
                : filterTag
                ? `No notes found with tag #${filterTag}`
                : "No notes available. Be the first to share!"}
            </p>
            {user && viewMode === 'my' && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setSelectedNote(null);
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredNotes().map(note => (
              <div 
                key={note._id} 
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedNote(note)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 truncate">{note.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    By {note.username} • {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                  <div className="h-24 overflow-hidden text-gray-300 mb-4">
                    {note.content}
                  </div>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="bg-gray-700 text-blue-300 text-xs px-2 py-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterTag(tag);
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-900 px-6 py-3 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-gray-400 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(note._id);
                      }}
                    >
                      <Heart 
                        size={18} 
                        fill={hasUserLikedNote(note) ? "#f87171" : "none"} 
                        color={hasUserLikedNote(note) ? "#f87171" : "currentColor"}
                      />
                    </button>
                    <span className="text-gray-400 text-sm">{note.likes || 0}</span>
                  </div>
                  
                  {user && note.userId === user.id.toString() && (
                    <div className="flex items-center space-x-3">
                      <button 
                        className="text-gray-400 hover:text-blue-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNote(note);
                          setShowForm(true);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id);
                        }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
