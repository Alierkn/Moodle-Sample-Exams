import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Folder, Search, Filter, Grid, List,
  Download, Share2, Trash2, Edit3, Star, Clock, Eye,
  Plus, FolderPlus, SortAsc, SortDesc, RefreshCw,
  File, Image, Video, Music, Archive, Code, BookOpen,
  Calendar, User, Tag, ChevronDown, X, MoreVertical,
  CloudUpload, HardDrive, Globe, Lock
} from 'lucide-react';

// Mock data for documents
const mockDocuments = [
  {
    id: 1,
    name: 'JavaScript Fundamentals Guide.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadedAt: '2024-06-10T14:30:00Z',
    uploadedBy: 'John Doe',
    category: 'Programming',
    tags: ['JavaScript', 'Tutorial', 'Fundamentals'],
    description: 'Complete guide to JavaScript fundamentals including variables, functions, and control structures.',
    downloads: 145,
    views: 1234,
    starred: true,
    shared: false,
    privacy: 'public'
  },
  {
    id: 2,
    name: 'React Best Practices.docx',
    type: 'docx',
    size: '1.8 MB',
    uploadedAt: '2024-06-08T09:15:00Z',
    uploadedBy: 'Jane Smith',
    category: 'Programming',
    tags: ['React', 'Best Practices', 'Components'],
    description: 'Essential React best practices for writing clean and maintainable code.',
    downloads: 89,
    views: 567,
    starred: false,
    shared: true,
    privacy: 'private'
  },
  {
    id: 3,
    name: 'Database Design Patterns.pptx',
    type: 'pptx',
    size: '5.2 MB',
    uploadedAt: '2024-06-05T16:45:00Z',
    uploadedBy: 'Mike Johnson',
    category: 'Database',
    tags: ['Database', 'Design Patterns', 'SQL'],
    description: 'Comprehensive presentation on database design patterns and normalization.',
    downloads: 234,
    views: 892,
    starred: true,
    shared: false,
    privacy: 'public'
  },
  {
    id: 4,
    name: 'Algorithm Complexity Analysis.xlsx',
    type: 'xlsx',
    size: '892 KB',
    uploadedAt: '2024-06-03T11:20:00Z',
    uploadedBy: 'Sarah Wilson',
    category: 'Algorithms',
    tags: ['Algorithms', 'Complexity', 'Big O'],
    description: 'Detailed analysis of algorithm complexity with examples and calculations.',
    downloads: 67,
    views: 345,
    starred: false,
    shared: true,
    privacy: 'public'
  },
  {
    id: 5,
    name: 'UI UX Design Principles.figma',
    type: 'figma',
    size: '12.5 MB',
    uploadedAt: '2024-06-01T13:30:00Z',
    uploadedBy: 'Alex Chen',
    category: 'Design',
    tags: ['UI', 'UX', 'Design', 'Figma'],
    description: 'Complete UI/UX design system with components and design principles.',
    downloads: 156,
    views: 789,
    starred: true,
    shared: false,
    privacy: 'private'
  }
];

const mockFolders = [
  { id: 1, name: 'Programming Tutorials', documentCount: 15, createdAt: '2024-05-15' },
  { id: 2, name: 'Database Resources', documentCount: 8, createdAt: '2024-05-10' },
  { id: 3, name: 'Design Assets', documentCount: 23, createdAt: '2024-05-05' },
  { id: 4, name: 'Project Documentation', documentCount: 12, createdAt: '2024-04-28' }
];

// Enhanced DocumentUpload Component
const DocumentUpload = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleUpload(files);
  };

  const handleUpload = async (files) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    setUploading(false);
    setUploadProgress(0);
    onUploadSuccess();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <CloudUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Documents</h2>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            isDragging ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Upload className={`w-8 h-8 ${
              isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
            }`} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isDragging ? 'Drop files here' : 'Drag & drop files'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or <span className="text-blue-600 dark:text-blue-400 font-medium">browse files</span>
            </p>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            Supports: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, MD
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Uploading... {uploadProgress}%
              </p>
              <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Uploads */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Uploads</h3>
        <div className="space-y-2">
          {mockDocuments.slice(0, 3).map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <FileText className="w-4 h-4 text-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced DocumentList Component
const DocumentList = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [folders, setFolders] = useState(mockFolders);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());

  const getFileIcon = (type) => {
    const iconProps = { className: "w-8 h-8" };
    switch (type?.toLowerCase()) {
      case 'pdf': return <FileText {...iconProps} className="w-8 h-8 text-red-500" />;
      case 'docx':
      case 'doc': return <FileText {...iconProps} className="w-8 h-8 text-blue-500" />;
      case 'pptx':
      case 'ppt': return <FileText {...iconProps} className="w-8 h-8 text-orange-500" />;
      case 'xlsx':
      case 'xls': return <FileText {...iconProps} className="w-8 h-8 text-green-500" />;
      case 'jpg':
      case 'png':
      case 'gif': return <Image {...iconProps} className="w-8 h-8 text-purple-500" />;
      case 'mp4':
      case 'avi': return <Video {...iconProps} className="w-8 h-8 text-indigo-500" />;
      case 'figma': return <Code {...iconProps} className="w-8 h-8 text-pink-500" />;
      default: return <File {...iconProps} className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (size) => {
    return size;
  };

  const toggleDocumentSelection = (id) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDocuments(newSelected);
  };

  const toggleStar = (id) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, starred: !doc.starred } : doc
    ));
  };

  const filteredDocuments = documents
    .filter(doc => {
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
      if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = parseFloat(a.size) - parseFloat(b.size);
          break;
        case 'downloads':
          comparison = a.downloads - b.downloads;
          break;
        case 'date':
        default:
          comparison = new Date(a.uploadedAt) - new Date(b.uploadedAt);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const categories = ['all', ...new Set(documents.map(doc => doc.category))];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7" />
            <div>
              <h2 className="text-2xl font-bold">Document Library</h2>
              <p className="text-purple-100">{filteredDocuments.length} documents available</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-white/20' : 'hover:bg-white/20'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
          <input
            type="text"
            placeholder="Search documents, tags, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="date">Upload Date</option>
                <option value="name">Name</option>
                <option value="size">File Size</option>
                <option value="downloads">Downloads</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Folders Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Folders</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {folders.map(folder => (
            <div key={folder.id} className="group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Folder className="w-6 h-6 text-blue-500 group-hover:text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white truncate">{folder.name}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {folder.documentCount} documents
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Content */}
      <div className="p-6">
        {selectedDocuments.size > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedDocuments.size} document(s) selected
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Download
                </button>
                <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-3"
          }>
            {filteredDocuments.map(document => (
              <div
                key={document.id}
                className={`group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800 ${
                  selectedDocuments.has(document.id) ? 'ring-2 ring-blue-500' : ''
                } ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.has(document.id)}
                          onChange={() => toggleDocumentSelection(document.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {getFileIcon(document.type)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(document.id);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Star 
                            className={`w-4 h-4 ${
                              document.starred 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-400 hover:text-yellow-500'
                            }`} 
                          />
                        </button>
                        
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {document.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {document.description}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {document.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {document.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            +{document.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {document.uploadedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(document.uploadedAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {document.size}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {document.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {document.downloads}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="flex items-center p-4 w-full">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(document.id)}
                        onChange={() => toggleDocumentSelection(document.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex-shrink-0">
                        {getFileIcon(document.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {document.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {document.category} • {document.size} • {formatDate(document.uploadedAt)}
                        </p>
                      </div>

                      <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {document.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {document.downloads}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();