import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, RefreshCw, Trophy, Clock, Zap, Users, 
  Star, CheckCircle, Play, Target, Code, TrendingUp,
  SlidersHorizontal, Grid, List, BookOpen, Award,
  ChevronDown, X, Hash, Globe, Database, Cpu, Fire
} from 'lucide-react';

// Mock data and services
const mockChallenges = [
  {
    id: 1,
    title: 'Two Sum Algorithm',
    description: 'Find two numbers in an array that add up to a specific target. A classic problem that tests your understanding of hash tables and array manipulation.',
    difficulty: 'Easy',
    language: 'Python',
    points: 100,
    timeEstimate: 15,
    completedBy: 1234,
    successRate: 85,
    tags: ['Array', 'Hash Table', 'Algorithm'],
    completed: true,
    starred: false,
    premium: false,
    createdAt: '2024-01-15',
    category: 'Data Structures'
  },
  {
    id: 2,
    title: 'Binary Tree Traversal',
    description: 'Implement different tree traversal algorithms including inorder, preorder, and postorder traversal methods.',
    difficulty: 'Medium',
    language: 'Python',
    points: 200,
    timeEstimate: 30,
    completedBy: 892,
    successRate: 72,
    tags: ['Tree', 'Recursion', 'DFS'],
    completed: false,
    starred: true,
    premium: false,
    createdAt: '2024-01-10',
    category: 'Algorithms'
  },
  {
    id: 3,
    title: 'Database Query Optimization',
    description: 'Optimize complex SQL queries for better performance. Learn about indexing, joins, and query execution plans.',
    difficulty: 'Hard',
    language: 'SQL',
    points: 300,
    timeEstimate: 45,
    completedBy: 456,
    successRate: 58,
    tags: ['SQL', 'Performance', 'Database'],
    completed: false,
    starred: false,
    premium: true,
    createdAt: '2024-01-08',
    category: 'Database'
  },
  {
    id: 4,
    title: 'Neo4j Graph Queries',
    description: 'Write efficient Cypher queries to traverse and analyze graph data structures in Neo4j database.',
    difficulty: 'Medium',
    language: 'Neo4j',
    points: 250,
    timeEstimate: 35,
    completedBy: 234,
    successRate: 65,
    tags: ['Graph', 'Cypher', 'NoSQL'],
    completed: true,
    starred: true,
    premium: false,
    createdAt: '2024-01-05',
    category: 'Database'
  },
  {
    id: 5,
    title: 'MongoDB Aggregation Pipeline',
    description: 'Master MongoDB aggregation framework to transform and analyze document data efficiently.',
    difficulty: 'Medium',
    language: 'MongoDB',
    points: 220,
    timeEstimate: 25,
    completedBy: 678,
    successRate: 70,
    tags: ['MongoDB', 'Aggregation', 'NoSQL'],
    completed: false,
    starred: false,
    premium: false,
    createdAt: '2024-01-03',
    category: 'Database'
  },
  {
    id: 6,
    title: 'Dynamic Programming Fibonacci',
    description: 'Implement fibonacci sequence using dynamic programming techniques for optimal time complexity.',
    difficulty: 'Easy',
    language: 'Python',
    points: 120,
    timeEstimate: 20,
    completedBy: 1567,
    successRate: 78,
    tags: ['Dynamic Programming', 'Math', 'Optimization'],
    completed: true,
    starred: false,
    premium: false,
    createdAt: '2024-01-01',
    category: 'Algorithms'
  }
];

const getChallenges = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    challenges: mockChallenges
  };
};

const useToast = () => ({
  showSuccess: (message) => console.log('Success:', message),
  showError: (message) => console.log('Error:', message)
});

// Enhanced Skeleton Component
const CardSkeleton = ({ className }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
      </div>
    </div>
  </div>
);

/**
 * Modern Enhanced Challenge List Component
 */
import { Star, Award, Filter, List, Grid, RefreshCcw } from 'lucide-react';

const ChallengeList = ({ onSelectChallenge }) => {
  const [challenges, setChallenges] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'points', 'completed', 'difficulty'
  const [footerStats, setFooterStats] = useState({ completed: 0, starred: 0, premium: 0, points: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { showSuccess, showError } = useToast();
  
  const [filters, setFilters] = useState({
    language: 'all',
    difficulty: 'all',
    category: 'all',
    search: '',
    completed: 'all',
    starred: false,
    premium: 'all'
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    // Calculate footer stats
    const completed = challenges.filter(ch => ch.completed).length;
    const starred = challenges.filter(ch => ch.starred).length;
    const premium = challenges.filter(ch => ch.premium).length;
    const points = challenges.reduce((sum, ch) => sum + (ch.points || 0), 0);
    setFooterStats({ completed, starred, premium, points });
  }, [challenges]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const result = await getChallenges();
      
      if (result.success) {
        setChallenges(result.challenges || []);
        showSuccess(`${result.challenges?.length || 0} challenges loaded`);
      } else {
        setError(result.message || 'Failed to load challenges');
        showError(result.message || 'Failed to load challenges');
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('An unexpected error occurred');
      showError('An unexpected error occurred while loading challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      language: 'all',
      difficulty: 'all',
      category: 'all',
      search: '',
      completed: 'all',
      starred: false,
      premium: 'all'
    });
  };

  const toggleStar = (challengeId, e) => {
    e.stopPropagation();
    setChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, starred: !challenge.starred }
          : challenge
      )
    );
  };

  // Filtered and sorted challenges
  const filteredChallenges = useMemo(() => {
    let sortedChallenges = [...challenges];
    if (sortBy === 'points') sortedChallenges.sort((a, b) => b.points - a.points);
    if (sortBy === 'completed') sortedChallenges.sort((a, b) => (b.completedBy || 0) - (a.completedBy || 0));
    if (sortBy === 'difficulty') sortedChallenges.sort((a, b) => {
      const order = { easy: 1, medium: 2, hard: 3 };
      return (order[a.difficulty?.toLowerCase()] || 0) - (order[b.difficulty?.toLowerCase()] || 0);
    });

    const filteredChallenges = sortedChallenges.filter(challenge => {
      // Search filter
      if (filters.search && !challenge.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !challenge.description.toLowerCase().includes(filters.search.toLowerCase()) &&
          !challenge.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }
      
      // Language filter
      if (filters.language !== 'all' && challenge.language !== filters.language) {
        return false;
      }
      
      // Difficulty filter
      if (filters.difficulty !== 'all' && challenge.difficulty !== filters.difficulty) {
        return false;
      }
      
      // Category filter
      if (filters.category !== 'all' && challenge.category !== filters.category) {
        return false;
      }
      
      // Completed filter
      if (filters.completed === 'completed' && !challenge.completed) {
        return false;
      }
      if (filters.completed === 'not-completed' && challenge.completed) {
        return false;
      }
      
      // Starred filter
      if (filters.starred && !challenge.starred) {
        return false;
      }
      
      // Premium filter
      if (filters.premium === 'premium' && !challenge.premium) {
        return false;
      }
      if (filters.premium === 'free' && challenge.premium) {
        return false;
      }
      
      return true;
    });

    return filteredChallenges;
  }, [challenges, filters, sortBy]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'hard':
        return 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getLanguageIcon = (language) => {
    const iconProps = { size: 16, className: "inline" };
    switch (language.toLowerCase()) {
      case 'python': return <Code {...iconProps} className="inline text-blue-600" />;
      case 'neo4j': return <Database {...iconProps} className="inline text-purple-600" />;
      case 'mongodb': return <Database {...iconProps} className="inline text-green-600" />;
      case 'sql': return <Database {...iconProps} className="inline text-orange-600" />;
      default: return <Code {...iconProps} className="inline text-gray-600" />;
    }
  };

  const getLanguageColor = (language) => {
    switch (language.toLowerCase()) {
      case 'python':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'neo4j':
        return 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'mongodb':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'sql':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== 'all' && value !== '' && value !== false
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Challenge Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl animate-pulse">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Challenges</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={fetchChallenges}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 animate-pulse"></div>
        
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Coding Challenges
              </h2>
              <p className="text-blue-100">{filteredChallenges.length} challenges available</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all duration-200 backdrop-blur-sm ${showFilters ? 'bg-white/20' : 'hover:bg-white/20'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            
            <button
              onClick={fetchChallenges}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
          <input
            type="text"
            placeholder="Search challenges, tags, or descriptions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all duration-300"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Code className="w-4 h-4 inline mr-1" />
                Language
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Languages</option>
                <option value="Python">Python</option>
                <option value="Neo4j">Neo4j</option>
                <option value="MongoDB">MongoDB</option>
                <option value="SQL">SQL</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Categories</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Database">Database</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="points">Highest Points</option>
                <option value="difficulty">Difficulty</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.starred}
                onChange={(e) => handleFilterChange('starred', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 transition-all"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Star className="w-4 h-4 inline mr-1" />
                Starred Only
              </span>
            </label>

            <select
              value={filters.completed}
              onChange={(e) => handleFilterChange('completed', e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Challenges</option>
              <option value="completed">Completed</option>
              <option value="not-completed">Not Completed</option>
            </select>

            <select
              value={filters.premium}
              onChange={(e) => handleFilterChange('premium', e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Types</option>
              <option value="free">Free Only</option>
              <option value="premium">Premium Only</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No challenges found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search terms to find challenges.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredChallenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => onSelectChallenge?.(challenge)}
                className={`group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800 hover:scale-105 ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {challenge.completed && (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                          {challenge.premium && (
                            <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          )}
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {challenge.title}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => toggleStar(challenge.id, e)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200 hover:scale-110"
                        >
                          <Star 
                            className={`w-5 h-5 transition-all duration-200 ${
                              challenge.starred 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-400 hover:text-yellow-500'
                            }`} 
                          />
                        </button>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {challenge.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {challenge.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-700 hover:scale-105 transition-transform duration-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {challenge.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                          +{challenge.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Success Rate</span>
                        <span>{challenge.successRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${challenge.successRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getLanguageColor(challenge.language)}`}>
                          {getLanguageIcon(challenge.language)}
                          <span className="ml-1">{challenge.language}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
                          <Zap className="w-3 h-3" />
                          {challenge.points}
                        </span>
                        <span className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                          <Clock className="w-3 h-3" />
                          {challenge.timeEstimate}m
                        </span>
                        <span className="flex items-center gap-1 hover:text-green-500 transition-colors">
                          <Users className="w-3 h-3" />
                          {challenge.completedBy.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 group">
                        <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {challenge.completed ? 'View Solution' : 'Start Challenge'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // List view
                  <div className="flex items-center p-4 w-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {challenge.completed && (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                        {challenge.premium && (
                          <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {challenge.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getLanguageColor(challenge.language)}`}>
                          {getLanguageIcon(challenge.language)}
                          <span className="ml-1">{challenge.language}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm truncate mb-2">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {challenge.points} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {challenge.timeEstimate}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {challenge.completedBy.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {challenge.successRate}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={(e) => toggleStar(challenge.id, e)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200 hover:scale-110"
                      >
                        <Star 
                          className={`w-5 h-5 transition-all duration-200 ${
                            challenge.starred 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`} 
                        />
                      </button>
                      
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center gap-2 group">
                        <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {challenge.completed ? 'Review' : 'Start'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <Fire className="w-4 h-4 text-orange-500" />
              {challenges.filter(c => c.completed).length} completed
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              {challenges.filter(c => c.starred).length} starred
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              {challenges.filter(c => c.premium).length} premium
            </span>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Points Available: {challenges.reduce((sum, c) => sum + c.points, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeList;