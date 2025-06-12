import React from 'react';
import { X, Edit, Trash, Heart, Calendar, User, Globe, Lock } from 'lucide-react';

export default function NoteDetail({ 
  note, 
  onClose, 
  onEdit, 
  onDelete, 
  onLike, 
  isLiked, 
  isOwner,
  currentUser 
}) {
  if (!note) return null;
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{note.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {/* Metadata */}
          <div className="flex flex-wrap items-center text-sm text-gray-400 mb-6 gap-4">
            <div className="flex items-center">
              <User size={16} className="mr-1" />
              <span>{note.username}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              <span>Created: {formatDate(note.createdAt)}</span>
            </div>
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>Updated: {formatDate(note.updatedAt)}</span>
              </div>
            )}
            <div className="flex items-center">
              {note.isPublic ? (
                <>
                  <Globe size={16} className="mr-1 text-green-500" />
                  <span className="text-green-500">Public</span>
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-1 text-yellow-500" />
                  <span className="text-yellow-500">Private</span>
                </>
              )}
            </div>
          </div>
          
          {/* Main content */}
          <div className="whitespace-pre-wrap mb-6">
            {note.content}
          </div>
          
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-gray-700 text-blue-300 text-xs px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button 
              onClick={onLike}
              disabled={!currentUser}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                currentUser 
                  ? 'hover:bg-gray-700' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={currentUser ? 'Like this note' : 'Login to like notes'}
            >
              <Heart 
                size={18} 
                fill={isLiked ? "#f87171" : "none"} 
                color={isLiked ? "#f87171" : "currentColor"}
              />
              <span>{note.likes || 0}</span>
            </button>
          </div>
          
          {isOwner && (
            <div className="flex space-x-3">
              <button
                onClick={onEdit}
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 px-3 py-1"
              >
                <Edit size={18} />
                <span>Edit</span>
              </button>
              
              <button
                onClick={onDelete}
                className="flex items-center space-x-1 text-red-400 hover:text-red-300 px-3 py-1"
              >
                <Trash size={18} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
