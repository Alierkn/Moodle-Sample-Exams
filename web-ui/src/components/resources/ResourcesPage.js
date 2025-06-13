import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Download, Search, Filter, ExternalLink, 
  Clock, AlertCircle, Plus, Edit, Trash, Upload,
  File, PieChart, ImageIcon
} from 'lucide-react';
import { documentService } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const ResourcesPage = () => {
  const { user, isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Resource editing state variables
  const [isEditing, setIsEditing] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    description: '',
    category: 'general',
    type: 'document'
  });
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Track which resource is being downloaded
  const [downloadingResourceId, setDownloadingResourceId] = useState(null);
  
  // Feedback notifications
  const [notification, setNotification] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  
  // Utility function to format Supabase documents into resources
  const formatDocuments = (documents) => {
    if (!documents || documents.length === 0) return [];
    
    return documents.map(doc => ({
      id: doc.id,
      title: doc.name || 'Untitled Document',
      description: doc.metadata?.description || '',
      type: doc.metadata?.type || 'document',
      category: doc.metadata?.category || 'general',
      url: doc.name,
      size: formatBytes(doc.metadata?.size || 0),
      createdAt: doc.created_at,
      updatedAt: doc.updated_at
    }));
  };
  
  // Fetch resources from Supabase
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get documents from Supabase storage
        const { success, documents, error: apiError, message } = await documentService.listDocuments();
        
        // Check if in mock mode and handle gracefully
        if (message && message.includes('mock mode')) {
          console.info('Running in mock mode - using sample documents');
          // In mock mode, we could load sample resources instead of showing an error
          const mockResources = [
            { id: 'mock-1', name: 'Sample PDF Document', metadata: { description: 'This is a sample document for testing', type: 'pdf', category: 'general', size: 1024000 }, created_at: new Date().toISOString() },
            { id: 'mock-2', name: 'Sample Presentation', metadata: { description: 'A sample presentation document', type: 'presentation', category: 'lecture', size: 2048000 }, created_at: new Date().toISOString() },
            { id: 'mock-3', name: 'Sample Spreadsheet', metadata: { description: 'Sample data for analysis', type: 'spreadsheet', category: 'data', size: 512000 }, created_at: new Date().toISOString() }
          ];
          const formattedMockResources = formatDocuments(mockResources);
          setResources(formattedMockResources);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        
        if (!success) {
          throw new Error(apiError || 'Failed to fetch documents');
        }
        
        if (!documents || documents.length === 0) {
          setResources([]);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        
        // Format resources
        const formattedResources = formatDocuments(documents);
        
        // Calculate total pages
        const calculatedTotalPages = Math.max(1, Math.ceil(formattedResources.length / itemsPerPage));
        setTotalPages(calculatedTotalPages);
        
        // Set resources
        setResources(formattedResources);
        
        // Reset to first page if current page is out of bounds
        if (currentPage > calculatedTotalPages) {
          setCurrentPage(1);
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error('Error loading documents:', err);
        
        // Try to provide a more helpful error message
        let errorMessage = 'Documents could not be loaded. Please try again later.';
        
        // Check for specific Supabase error types
        if (err.message?.includes('JWT')) {
          errorMessage = 'Authentication error. Please log out and log back in.';
        } else if (err.message?.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message?.includes('permission') || err.message?.includes('access')) {
          errorMessage = 'You do not have permission to access these documents.';
        }
        
        setError(errorMessage);
        setResources([]);
        setTotalPages(1);
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [itemsPerPage, currentPage]);
  
  // Format bytes to readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Kaynak ekleme/düzenleme/silme işlevleri
  const handleAddResource = () => {
    // Only admins can add resources
    if (!isAdmin) {
      alert('Only administrators can add documents.');
      return;
    }
    
    setIsEditing(true);
    setEditingResource(null);
    setResourceForm({
      title: '',
      description: '',
      type: 'pdf',
      category: 'general',
      url: '',
      size: ''
    });
    setFileToUpload(null);
  };
  
  const handleEditResource = (resource) => {
    // Only admins can edit resources
    if (!isAdmin) {
      alert('Only administrators can edit documents.');
      return;
    }
    
    setIsEditing(true);
    setEditingResource(resource);
    setResourceForm({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      url: resource.url
    });
  };
  
  const handleDeleteResource = async (id) => {
    // Only admins can delete resources
    if (!isAdmin) {
      alert('Only administrators can delete documents.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // Find the resource first so we know what's being deleted
        const resource = resources.find(r => r.id === id);
        const resourceTitle = resource?.title || 'Document';
        
        if (!resource) {
          throw new Error('Resource not found');
        }
        
        // Set a loading state for better UX
        const deleteResourceId = resource.url.split('/').pop();
        setDownloadingResourceId(deleteResourceId); // Reuse the downloading state to show loading
        
        const { success, error: deleteError, message } = await documentService.deleteDocument(resource.url);
        
        // Handle mock mode
        if (message && message.includes('mock mode')) {
          console.info('Running in mock mode - delete simulated');
          // Show notification that operation was simulated
          setNotification(`Mock mode active: Document "${resourceTitle}" deletion simulated.`);
          setTimeout(() => setNotification(null), 3000);
          
          // Still remove from UI in mock mode
          setResources(prevResources => prevResources.filter(r => r.id !== id));
          setDownloadingResourceId(null);
          return;
        }
        
        if (!success) {
          throw new Error(deleteError || 'Failed to delete document');
        }
        
        // Remove from resources list
        setResources(prevResources => prevResources.filter(r => r.id !== id));
        
        // Calculate new total pages
        const newResources = resources.filter(r => r.id !== id);
        const newTotalPages = Math.max(1, Math.ceil(newResources.length / itemsPerPage));
        setTotalPages(newTotalPages);
        
        // If current page is now empty and not the first page, go to previous page
        const currentPageItems = newResources.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );
        
        if (currentPageItems.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        
        // Show success notification
        setNotification(`Document "${resourceTitle}" was deleted successfully.`);
        setTimeout(() => setNotification(null), 3000);
        
        setDownloadingResourceId(null);
        
      } catch (err) {
        console.error('Error deleting document:', err);
        
        // Provide more specific error messages based on the error
        let errorMessage = 'Failed to delete document. Please try again.';
        
        if (err.message?.includes('permission')) {
          errorMessage = 'You do not have permission to delete this document.';
        } else if (err.message?.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        setError(errorMessage);
        setDownloadingResourceId(null);
      }
    }
  };
  
  // Valid file types for upload
  const VALID_FILE_TYPES = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'text/plain',
    'text/csv'
  ];
  
  // Validate file type and size (max 20MB)
  const validateFile = (file) => {
    if (!file) return { valid: false, error: 'No file selected' };
    
    // Check file type
    if (!VALID_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload a document, spreadsheet, presentation, image, or video file.' };
    }
    
    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return { valid: false, error: 'File is too large. Maximum size is 20MB.' };
    }
    
    return { valid: true };
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validation = validateFile(file);
      
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      
      setError(null);
      setFileToUpload(file);
      setResourceForm(prev => ({
        ...prev,
        type: getFileType(file.name)
      }));
    }
  };
  
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'doc';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(extension)) return 'presentation';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) return 'image';
    if (['mp4', 'mov', 'avi'].includes(extension)) return 'video';
    
    return 'document';
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setResourceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Only admins can submit the form
    if (!isAdmin) {
      alert('Only administrators can upload documents.');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      if (editingResource) {
        // Extract the filename from the URL path
        const filename = editingResource.url.split('/').pop();
        
        if (!filename) {
          throw new Error('Invalid document path');
        }
        
        // Update document metadata (we can't change the file itself)
        const { success, error: updateError, message } = await documentService.updateDocumentMetadata(
          filename, // Just pass the filename, not the full path
          {
            filename: filename, // Important: include the filename for lookup
            description: resourceForm.description,
            category: resourceForm.category,
            type: resourceForm.type,
            updated_at: new Date().toISOString(),
            // Preserve existing data that we don't want to change
            uploaded_by: user?.email || 'unknown'
          }
        );
        
        if (!success) {
          // Special handling for mock mode
          if (message && message.includes('mock mode')) {
            console.info('Running in mock mode - metadata update simulated');
          } else {
            throw new Error(updateError || 'Failed to update document metadata');
          }
        }
      } else if (fileToUpload) {
        // Generate a unique filename with timestamp
        const timestamp = Date.now();
        const safeFileName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueFilename = `${timestamp}_${safeFileName}`;
        
        // Upload new document
        const { success, document, error: uploadError, message } = await documentService.uploadDocument(fileToUpload, '');
        
        // Special handling for mock mode
        if (message && message.includes('mock mode')) {
          console.info('Running in mock mode - upload simulated');
          // In mock mode, we can pretend the upload was successful
          // Continue to metadata update which will also be mocked
        } else if (!success) {
          throw new Error(uploadError || 'Failed to upload document');
        }
        
        // Store the path - either from real upload or mock generated
        const filePath = document?.path || uniqueFilename;
        
        // After successful upload, add metadata separately using the path from the uploaded document
        const { success: metaSuccess, error: metaError } = await documentService.updateDocumentMetadata(
          filePath,
          {
            filename: filePath.split('/').pop(), // Just the filename part
            title: fileToUpload.name,
            description: resourceForm.description,
            category: resourceForm.category,
            type: resourceForm.type || getFileType(fileToUpload.name),
            size: fileToUpload.size,
            uploaded_by: user?.email || 'unknown',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
        
        if (!metaSuccess && !message?.includes('mock mode')) {
          console.warn('Metadata update failed:', metaError);
          // We don't throw here since the document was uploaded successfully
          // But we show a toast or warning to the user
          setError('Document uploaded but metadata could not be saved completely.');
        }
      } else {
        throw new Error('No file selected for upload');
      }
      
      // Reload the documents list
      const { success: listSuccess, documents, error: listError } = await documentService.listDocuments();
      
      if (!listSuccess) {
        throw new Error(listError || 'Failed to fetch updated document list');
      }
      
      // Format and set resources using the utility function
      setResources(formatDocuments(documents));
      
      // Calculate new total pages and update pagination if needed
      const newTotalPages = Math.max(1, Math.ceil(documents.length / itemsPerPage));
      setTotalPages(newTotalPages);
      
      // Display success notification
      if (editingResource) {
        setNotification(`Document "${editingResource.title}" was updated successfully.`);
      } else {
        setNotification(`Document "${fileToUpload.name}" was uploaded successfully.`);
      }
      
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
      
      // Reset form state
      setIsUploading(false);
      setIsEditing(false);
      setEditingResource(null);
      setFileToUpload(null);
      setResourceForm({
        title: '',
        description: '',
        type: 'pdf',
        category: 'general',
        url: '',
        size: ''
      });
      
    } catch (err) {
      console.error('Error saving document:', err);
      
      // Provide more specific error messages based on the error
      let errorMessage = 'Failed to save document. Please try again.';
      
      if (err.message?.includes('storage/quota-exceeded')) {
        errorMessage = 'Storage quota exceeded. Please contact the administrator.';
      } else if (err.message?.includes('permission')) {
        errorMessage = 'You do not have permission to upload documents.';
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      setIsUploading(false);
    }
  };
  
  const handleDownload = async (resourceUrl) => {
    try {
      // Show loading state only for this specific resource
      const resourceId = resourceUrl.split('/').pop();
      setDownloadingResourceId(resourceId);
      
      // First check if we're in mock mode
      const { success, url, error: apiError, message } = await documentService.getDocumentUrl(resourceUrl);
      
      // Handle mock mode gracefully
      if (message && message.includes('mock mode')) {
        console.info('Running in mock mode - download simulated');
        // Show a notification that we're in mock mode instead of failing
        setNotification('Mock mode active: In production, this would download the actual file.');
        setTimeout(() => setNotification(null), 3000); // Clear after 3 seconds
        setDownloadingResourceId(null);
        return;
      }
      
      if (!success) {
        throw new Error(apiError || 'Failed to get download URL');
      }
      
      // Create a hidden anchor element to trigger download instead of opening in new tab
      // This provides a better UX for downloading files
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank'; // Still open in new tab but with download behavior
      const filename = resourceUrl.split('/').pop() || 'document';
      link.download = filename; // Set download filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success notification
      setNotification(`Document "${filename}" download started.`);
      
      // Auto-dismiss notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
      
      setDownloadingResourceId(null);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to download document. Please try again.';
      
      if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message?.includes('permission') || err.message?.includes('access')) {
        errorMessage = 'You do not have permission to download this document.';
      } else if (err.message?.includes('not found')) {
        errorMessage = 'Document not found. It may have been deleted or moved.';
      }
      
      setError(errorMessage);
      setDownloadingResourceId(null);
    }
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingResource(null);
    setFileToUpload(null);
    setError(null);
  };

  // Filter resources based on search term and category
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || resource.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageItems = filteredResources.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate pagination details
  const paginationTotalPages = Math.max(1, Math.ceil(filteredResources.length / itemsPerPage));
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'video':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'document':
        return <FileText className="w-6 h-6 text-blue-700" />;
      case 'presentation':
        return <FileText className="w-6 h-6 text-orange-500" />;
      case 'image':
        return <ImageIcon className="w-6 h-6 text-purple-500" />;
      case 'spreadsheet':
        return <FileText className="w-6 h-6 text-green-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success notification */}
      {notification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>{notification}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-green-700 hover:text-green-900 focus:outline-none"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-1">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Resources</h2>
        </div>

        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
          </div>

          <div className="relative">
            <select
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm appearance-none focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="python">Python</option>
              <option value="sql">SQL</option>
              <option value="neo4j">Neo4j</option>
              <option value="mongodb">MongoDB</option>
              <option value="general">General</option>
            </select>
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
          </div>

          {isAdmin ? (
            <button
              onClick={handleAddResource}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm text-sm font-medium flex items-center gap-1"
              title="Admin only: Upload new document"
            >
              <Upload size={16} />
              <span>Upload Document</span>
            </button>
          ) : (
            <div className="text-xs text-gray-500 italic flex items-center gap-1">
              <AlertCircle size={14} />
              <span>Only administrators can upload documents</span>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingResource ? 'Edit Document' : 'Upload New Document'}
          </h3>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md mb-4 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {!editingResource && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Upload</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 flex flex-col items-center justify-center">
                  {fileToUpload ? (
                    <div className="text-center">
                      <div className="text-sm font-medium">{fileToUpload.name}</div>
                      <div className="text-xs text-gray-500">{formatBytes(fileToUpload.size)}</div>
                      <button
                        type="button"
                        className="mt-2 text-xs text-red-500 hover:text-red-700"
                        onClick={() => setFileToUpload(null)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, documents, images up to 10MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    className={fileToUpload ? "hidden" : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={resourceForm.title}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                value={resourceForm.description}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  name="type"
                  value={resourceForm.type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="presentation">Presentation</option>
                  <option value="image">Image</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  name="category"
                  value={resourceForm.category}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value="python">Python</option>
                  <option value="sql">SQL</option>
                  <option value="neo4j">Neo4j</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            {isUploading && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                  <span>Uploading document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm text-sm font-medium flex items-center gap-1"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>{editingResource ? 'Update' : 'Upload'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">{error}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No resources found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentPageItems.map((resource) => (
            <div
              key={resource.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  {getResourceIcon(resource.type)}
                </div>

                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{resource.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{resource.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{formatDate(resource.created_at)}</span>
                    </div>
                    <div>•</div>
                    <div>{resource.size}</div>
                    <div>•</div>
                    <div className="capitalize">{resource.type}</div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-start space-x-2 mt-4 md:mt-0">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditResource(resource)}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors flex items-center gap-1"
                        title="Admin only: Edit document metadata"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center gap-1"
                        title="Admin only: Delete document"
                      >
                        <Trash size={16} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDownload(resource.url)}
                    disabled={downloadingResourceId === resource.url.split('/').pop()}
                    className={`px-3 py-2 ${downloadingResourceId === resource.url.split('/').pop() ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400'} rounded-lg transition-colors flex items-center gap-1`}
                  >
                    {downloadingResourceId === resource.url.split('/').pop() ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-gray-500 dark:border-gray-400 border-t-transparent rounded-full mr-1"></span>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && filteredResources.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: paginationTotalPages }, (_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx + 1)}
                className={`relative inline-flex items-center px-4 py-2 border ${currentPage === idx + 1 ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'} text-sm font-medium`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(paginationTotalPages, currentPage + 1))}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${currentPage === paginationTotalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={currentPage === paginationTotalPages}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Resource info message */}
      {user && !loading && !error && (
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Document Management</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {isAdmin ? (
              <>As an administrator, you can upload, edit metadata, and delete documents. All users can download documents.</>  
            ) : (
              <>You can download documents shared by administrators. Only administrators can upload new documents.</>  
            )}
          </p>
          {isAdmin && (
            <div className="flex space-x-3">
              <button 
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                onClick={handleAddResource}
              >
                <Upload size={20} />
                <span>Upload New Document</span>
              </button>
            </div>
          )}
        </div>
      )}

      {user && !loading && !error && (
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Resource Management</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You can manage your resources here.
          </p>
          <div className="flex space-x-3">
            <button 
              className="px-6 py-3 border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset the resources?')) {
                  localStorage.removeItem('userResources');
                  // Reset resources from storage
                  documentService.listDocuments().then(docs => setResources(docs || []));
                }
              }}
            >
              Varsayılan Verileri Geri Yükle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
