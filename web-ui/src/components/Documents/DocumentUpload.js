import React, { useState } from 'react';
import { uploadDocument } from '../../services/supabaseService';

/**
 * Document upload component
 * Allows users to upload documents with metadata
 */
const DocumentUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    description: '',
    category: 'Lecture Notes'
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleMetadataChange = (e) => {
    setMetadata({
      ...metadata,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setError('');
    setSuccess('');
    setUploading(true);
    
    try {
      const result = await uploadDocument(file, metadata);
      
      if (result.success) {
        setSuccess(`File ${result.filename} uploaded successfully!`);
        setFile(null);
        setMetadata({
          description: '',
          category: 'Lecture Notes'
        });
        
        // Reset the file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
        
        // Notify parent component
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('An unexpected error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    'Lecture Notes',
    'Past Exams',
    'Study Materials',
    'Assignments',
    'Solutions',
    'Other'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload Document</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file-upload">
            Select File
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            required
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Category
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="category"
            name="category"
            value={metadata.category}
            onChange={handleMetadataChange}
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            name="description"
            value={metadata.description}
            onChange={handleMetadataChange}
            rows="3"
            placeholder="Enter a description for this document"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload;
