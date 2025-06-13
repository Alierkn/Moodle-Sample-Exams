import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Download, Search, Filter, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { authService } from '../../services/supabase';

const ResourcesPage = ({ user }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch resources from Supabase
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        // This will be replaced with actual Supabase fetch when backend is ready
        // const { data, error } = await authService.supabase.from('resources').select('*');
        
        // For now, using mock data
        const mockData = [
          {
            id: 1,
            title: 'Python Programming Guide',
            description: 'Comprehensive guide to Python programming with examples',
            type: 'pdf',
            category: 'python',
            url: 'https://example.com/python-guide.pdf',
            created_at: '2025-05-01T10:30:00Z',
            size: '2.4 MB'
          },
          {
            id: 2,
            title: 'SQL Cheat Sheet',
            description: 'Quick reference for common SQL commands and syntax',
            type: 'pdf',
            category: 'sql',
            url: 'https://example.com/sql-cheatsheet.pdf',
            created_at: '2025-05-05T14:20:00Z',
            size: '1.1 MB'
          },
          {
            id: 3,
            title: 'Neo4j Graph Database Tutorial',
            description: 'Learn how to model and query graph databases with Neo4j',
            type: 'video',
            category: 'neo4j',
            url: 'https://example.com/neo4j-tutorial.mp4',
            created_at: '2025-05-10T09:15:00Z',
            size: '45.6 MB'
          },
          {
            id: 4,
            title: 'MongoDB Aggregation Pipeline Examples',
            description: 'Real-world examples of MongoDB aggregation pipelines',
            type: 'document',
            category: 'mongodb',
            url: 'https://example.com/mongodb-aggregation.docx',
            created_at: '2025-05-12T16:45:00Z',
            size: '3.2 MB'
          },
          {
            id: 5,
            title: 'Database Performance Optimization',
            description: 'Techniques for optimizing database performance across different systems',
            type: 'presentation',
            category: 'general',
            url: 'https://example.com/db-optimization.pptx',
            created_at: '2025-05-15T11:30:00Z',
            size: '5.8 MB'
          },
          {
            id: 6,
            title: 'Exam Preparation Guide',
            description: 'Tips and strategies for preparing for coding exams',
            type: 'pdf',
            category: 'general',
            url: 'https://example.com/exam-prep.pdf',
            created_at: '2025-05-20T08:00:00Z',
            size: '1.5 MB'
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setResources(mockData);
          setLoading(false);
        }, 800);
        
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Filter resources based on search term and category
  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Learning Resources</h1>
          <p className="text-gray-600 dark:text-gray-300">Access study materials and documentation for exam preparation</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
          </div>
        </div>
      </div>

      {loading ? (
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
                
                <div className="flex-shrink-0 flex items-start space-x-3 mt-4 md:mt-0">
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    <span>View</span>
                  </a>
                  <a 
                    href={resource.url} 
                    download
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && !loading && !error && (
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Request New Resources</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Don't see what you're looking for? Submit a request for new study materials or documentation.
          </p>
          <button 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={() => alert('Resource request feature coming soon!')}
          >
            Request Resource
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
