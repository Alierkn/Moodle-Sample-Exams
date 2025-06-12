import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Search, ExternalLink, Download, Folder, ChevronDown, ChevronRight, BookOpen as Book, FileText as File, GraduationCap, Clock, Star, Code } from 'lucide-react';
import apiService from '../../services/api';
import ResourceUpload from './ResourceUpload';

export default function Resources({ user, onResourceUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  
  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await apiService.getResources();
        if (response.success) {
          setResources(response.resources);
          
          // Initialize expanded state for all categories
          const categories = {};
          response.resources.forEach(resource => {
            categories[resource.category] = true; // Start with all expanded
          });
          setExpandedCategories(categories);
          
          // Fetch user favorites if logged in
          if (user) {
            const favResponse = await apiService.getFavorites();
            if (favResponse.success) {
              setFavorites(favResponse.favorites);
            }
          }
        } else {
          setError(response.message || 'Failed to load resources');
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError(err.response?.data?.message || 'Error loading resources');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [user]);
  
  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Filter resources by category and search term
  const getFilteredResources = () => {
    let filtered = resources;
    
    // Filter by category if not 'all'
    if (activeCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  // Toggle favorite status
  const toggleFavorite = async (resourceId) => {
    if (!user) return;
    
    try {
      const response = await apiService.toggleFavorite(resourceId);
      
      if (response.data.success) {
        if (favorites.includes(resourceId)) {
          setFavorites(favorites.filter(id => id !== resourceId));
        } else {
          setFavorites([...favorites, resourceId]);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };
  
  // Get unique categories from resources
  const categories = ['all', ...new Set(resources.map(resource => resource.category))];
  
  // Get icon based on resource type
  const getResourceIcon = (type) => {
    switch(type) {
      case 'pdf': return <File className="w-5 h-5 text-red-400" />;
      case 'link': return <ExternalLink className="w-5 h-5 text-blue-400" />;
      case 'image': return <FileText className="w-5 h-5 text-green-400" />;
      case 'video': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'lecture': return <GraduationCap className="w-5 h-5 text-yellow-400" />;
      case 'exam': return <Clock className="w-5 h-5 text-orange-400" />;
      case 'code': return <Code className="w-5 h-5 text-cyan-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };
  
  // Handle successful upload
  const handleUploadSuccess = (newResource) => {
    setResources(prevResources => [newResource, ...prevResources]);
    // Notify parent component to refresh resources
    if (onResourceUpdate) {
      onResourceUpdate();
    }
  };

  const filteredResources = getFilteredResources();
  
  return (
    <div className="space-y-6">
      {/* Resource Upload Component - Only show for authenticated users */}
      {user && <ResourceUpload onUploadSuccess={handleUploadSuccess} />}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          Resources
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none w-64"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              activeCategory === category 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category === 'all' ? 'All Resources' : category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-400">No resources found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map(resource => (
            <div 
              key={resource.id || resource._id} 
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getResourceIcon(resource.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                        {resource.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {resource.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                {user && (
                  <button 
                    onClick={() => toggleFavorite(resource.id || resource._id)}
                    className="text-gray-400 hover:text-yellow-500 transition-all"
                  >
                    <Star 
                      className={`w-5 h-5 ${favorites.includes(resource.id || resource._id) ? 'text-yellow-500 fill-yellow-500' : ''}`} 
                    />
                  </button>
                )}
              </div>
              
              <p className="text-gray-400 my-3">{resource.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {resource.author && `By ${resource.author}`}
                  {resource.date && ` • ${new Date(resource.date).toLocaleDateString()}`}
                </div>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all"
                >
                  {resource.type === 'pdf' || resource.type === 'exam' ? (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  ) : resource.type === 'video' ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Watch Video
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Open Resource
                    </>
                  )}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Categories Explanation */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Resource Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <GraduationCap className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-white">Lecture Notes</span>
            </div>
            <p className="text-sm text-gray-400">Professor's lecture notes and course materials.</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-orange-400 mr-2" />
              <span className="text-white">Past Exams</span>
            </div>
            <p className="text-sm text-gray-400">Previous years' exam papers with solutions.</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Book className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-white">Reference Materials</span>
            </div>
            <p className="text-sm text-gray-400">Additional reading and reference documents.</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Code className="h-5 w-5 text-cyan-400 mr-2" />
              <span className="text-white">Example Code</span>
            </div>
            <p className="text-sm text-gray-400">Example code snippets and sample solutions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
