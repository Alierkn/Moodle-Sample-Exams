import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';

const ResourceUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('pdf');
  const [author, setAuthor] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const categoryOptions = [
    'Lecture Notes',
    'Past Exams',
    'Reference Materials',
    'Example Code',
    'Tutorials',
    'Other'
  ];

  const typeOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'code', label: 'Code File' },
    { value: 'image', label: 'Image' },
    { value: 'link', label: 'External Link' },
    { value: 'video', label: 'Video' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-detect file type
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension === 'pdf') {
        setType('pdf');
      } else if (['py', 'js', 'java', 'c', 'cpp', 'cs', 'php', 'html', 'css', 'sql'].includes(fileExtension)) {
        setType('code');
      } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension)) {
        setType('image');
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setType('pdf');
    setAuthor('');
    setError(null);
    setSuccess(false);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && type !== 'link') {
      setError('Please select a file to upload');
      return;
    }

    if (!title) {
      setError('Please enter a title');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('type', type);
      formData.append('author', author);
      
      const response = await apiService.uploadResource(formData);
      
      if (response.success) {
        setSuccess(true);
        resetForm();
        setTimeout(() => {
          setSuccess(false);
          setShowForm(false);
          if (onUploadSuccess) {
            onUploadSuccess(response.resource);
          }
        }, 2000);
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <button 
        onClick={toggleForm}
        className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${
          showForm 
            ? 'bg-gray-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {showForm ? (
          <>
            <X className="h-5 w-5" />
            Cancel Upload
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            Upload New Resource
          </>
        )}
      </button>

      {showForm && (
        <div className="mt-4 bg-gray-800 rounded-lg border border-gray-700 p-5">
          <h3 className="text-xl font-bold text-white mb-4">Upload Resource</h3>
          
          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-900/30 border border-green-700 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              Resource uploaded successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">Title*</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Resource title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1 text-sm">Category*</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-1 text-sm">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe this resource"
                rows="3"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">Resource Type*</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1 text-sm">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Resource author"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-400 mb-1 text-sm">File Upload {type !== 'link' && '*'}</label>
              {type === 'link' ? (
                <input
                  type="url"
                  value={file || ''}
                  onChange={(e) => setFile(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/resource"
                  required
                />
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      {file ? (
                        <p className="text-sm text-gray-300">{file.name}</p>
                      ) : (
                        <>
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, code files, images (MAX 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 mr-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={uploading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-all ${
                  uploading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Resource
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResourceUpload;
