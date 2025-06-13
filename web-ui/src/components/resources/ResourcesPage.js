import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Download, Search, Filter, ExternalLink, Clock, AlertCircle, Plus, Edit, Trash, Upload } from 'lucide-react';
import { authService, documentService } from '../../services/supabase';

const ResourcesPage = ({ user }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Kaynak ekleme/düzenleme için state değişkenleri
  const [isEditing, setIsEditing] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'pdf',
    category: 'general',
    url: '',
    size: '1 MB'
  });
  
  // File upload state
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Check if user is admin
  const isAdmin = user?.profile?.role === 'admin';
  
  // Supabase'den kaynakları çek
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Supabase documentService kullanarak dökümanları getir
        const { data: documents, error } = await documentService.listDocuments();
        
        if (error) throw error;
        
        // Format documents in the expected structure
        const resourceData = documents.map(doc => ({
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
        
        setResources(resourceData);
        setLoading(false);
        
      } catch (err) {
        console.error('Error loading documents:', err);
        setError('Documents could not be loaded. Please try again later.');
        setLoading(false);
      }
    };

    fetchResources();
  }, []);
  
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
        setLoading(true);
        const resource = resources.find(r => r.id === id);
        
        if (!resource) {
          throw new Error('Resource not found');
        }
        
        const { error } = await documentService.deleteDocument(resource.url);
        
        if (error) throw error;
        
        // Reload documents list after deletion
        const { data: documents, error: listError } = await documentService.listDocuments();
        
        if (listError) throw listError;
        
        // Format documents in the expected structure
        const resourceData = documents.map(doc => ({
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
        
        setResources(resourceData);
        setLoading(false);
        
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Failed to delete document. Please try again.');
        setLoading(false);
      }
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
      // Update form with file info
      setResourceForm(prev => ({
        ...prev,
        title: e.target.files[0].name.split('.')[0],
        size: formatBytes(e.target.files[0].size),
        type: getFileType(e.target.files[0].name)
      }));
    }
  };
  
  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'document',
      'docx': 'document',
      'ppt': 'presentation',
      'pptx': 'presentation',
      'xls': 'document',
      'xlsx': 'document',
      'mp4': 'video',
      'mov': 'video',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
    };
    
    return typeMap[extension] || 'document';
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
        // Update document metadata (we can't change the file itself)
        const { error } = await documentService.updateDocumentMetadata(
          editingResource.url,
          {
            description: resourceForm.description,
            category: resourceForm.category,
            type: resourceForm.type
          }
        );
        
        if (error) throw error;
      } else {
        // Upload new document
        if (!fileToUpload) {
          throw new Error('Please select a file to upload.');
        }
        
        const { error } = await documentService.uploadDocument(
          fileToUpload,
          {
            description: resourceForm.description,
            category: resourceForm.category,
            type: resourceForm.type,
            size: fileToUpload.size
          }
        );
        
        if (error) throw error;
      }
      
      // Reload documents list
      const { data: documents, error: listError } = await documentService.listDocuments();
      
      if (listError) throw listError;
      
      // Format documents in the expected structure
      const resourceData = documents.map(doc => ({
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
      
      setResources(resourceData);
      setIsUploading(false);
      setIsEditing(false);
      setEditingResource(null);
      setFileToUpload(null);
      
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Failed to save document. Please try again.');
      setIsUploading(false);
    }
  };
  
  const handleDownload = async (resourceUrl) => {
    try {
      setLoading(true);
      const { data, error } = await documentService.getDocumentUrl(resourceUrl);
      
      if (error) throw error;
      
      // Open download URL in a new tab
      window.open(data, '_blank');
      setLoading(false);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document. Please try again.');
      setLoading(false);
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
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesFilter = filter === 'all' || resource.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Get icon based on resource type
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
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  // Format date
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
          {filteredResources.map(resource => (
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
                    className="px-3 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                  setResources(dataService.getResources());
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

const getResourceIcon = (type) => {
  switch (type) {
    case 'pdf':
      return <FilePdf size={24} />;
    case 'video':
      return <Video size={24} />;
    case 'document':
      return <FileText size={24} />;
    case 'presentation':
      return <PresentationChartLine size={24} />;
    case 'image':
      return <Image size={24} />;
    default:
      return <File size={24} />;
  }
};

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

export default ResourcesPage;
