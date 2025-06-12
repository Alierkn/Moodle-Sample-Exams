import React, { useState, useEffect, useMemo, useCallback, memo, Suspense, lazy } from 'react';
import { 
  Code, Trophy, Clock, Target, Filter, Search, Play, 
  CheckCircle, XCircle, Star, Zap, Award, Users, 
  TrendingUp, BookOpen, Settings, Maximize2, Minimize2,
  RotateCcw, Save, Share2, Download, HelpCircle,
  ChevronRight, ChevronLeft, Flame, Crown, Sparkles,
  Timer, Brain, Lightbulb, FileText
} from 'lucide-react';

// Mock data for challenges
const mockChallenges = [
  {
    id: 1,
    title: 'Two Sum Problem',
    description: 'Find two numbers in an array that add up to a target value.',
    difficulty: 'Easy',
    language: 'JavaScript',
    points: 100,
    timeLimit: 30,
    attempts: 1245,
    successRate: 78,
    tags: ['Array', 'Hash Table'],
    completed: true,
    starred: false,
    timeSpent: 12,
    bestScore: 95
  },
  {
    id: 2,
    title: 'Binary Tree Traversal',
    description: 'Implement different tree traversal algorithms (inorder, preorder, postorder).',
    difficulty: 'Medium',
    language: 'Python',
    points: 200,
    timeLimit: 45,
    attempts: 892,
    successRate: 65,
    tags: ['Tree', 'Recursion'],
    completed: false,
    starred: true,
    timeSpent: 0,
    bestScore: 0
  },
  {
    id: 3,
    title: 'Dynamic Programming - Fibonacci',
    description: 'Calculate the nth Fibonacci number using dynamic programming.',
    difficulty: 'Medium',
    language: 'JavaScript',
    points: 180,
    timeLimit: 35,
    attempts: 2341,
    successRate: 72,
    tags: ['Dynamic Programming', 'Math'],
    completed: true,
    starred: false,
    timeSpent: 28,
    bestScore: 88
  },
  {
    id: 4,
    title: 'Graph Shortest Path',
    description: 'Find the shortest path between two nodes in a weighted graph.',
    difficulty: 'Hard',
    language: 'Python',
    points: 300,
    timeLimit: 60,
    attempts: 456,
    successRate: 42,
    tags: ['Graph', 'Dijkstra', 'Algorithm'],
    completed: false,
    starred: true,
    timeSpent: 0,
    bestScore: 0
  },
  {
    id: 5,
    title: 'React Component Optimization',
    description: 'Optimize a React component for better performance using hooks and memoization.',
    difficulty: 'Hard',
    language: 'React',
    points: 350,
    timeLimit: 50,
    attempts: 234,
    successRate: 38,
    tags: ['React', 'Performance', 'Hooks'],
    completed: false,
    starred: false,
    timeSpent: 0,
    bestScore: 0
  }
];

// Enhanced ChallengeList Component - Optimized with memo
const ChallengeList = memo(({ onSelectChallenge, challenges, selectedChallenge }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('difficulty');

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const languages = ['All', 'JavaScript', 'Python', 'React', 'Java', 'C++'];
  const sortOptions = [
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'points', label: 'Points' },
    { value: 'successRate', label: 'Success Rate' },
    { value: 'attempts', label: 'Popularity' }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': 
        return 'text-green-600 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700';
      case 'Medium': 
        return 'text-yellow-600 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-700';
      case 'Hard': 
        return 'text-red-600 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 border-red-200 dark:border-red-700';
      default: 
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const filteredChallenges = useMemo(() => {
    return challenges
      .filter(challenge => 
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    .filter(challenge => 
      selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty
    )
    .filter(challenge => 
      selectedLanguage === 'All' || challenge.language === selectedLanguage
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'points': return b.points - a.points;
        case 'successRate': return b.successRate - a.successRate;
        case 'attempts': return b.attempts - a.attempts;
        default: 
          const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      }
    });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 animate-pulse"></div>
        
        <div className="relative">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Challenges ({filteredChallenges.length})
            </span>
          </h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
          
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {languages.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>Sort by {option.label}</option>
          ))}
        </select>
      </div>

      {/* Challenge List */}
      <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
        {filteredChallenges.map((challenge, index) => (
          <div
            key={challenge.id}
            onClick={() => onSelectChallenge(challenge)}
            className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 cursor-pointer transition-all duration-300 group ${
              selectedChallenge?.id === challenge.id ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex flex-col items-center gap-1">
                  {challenge.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                  )}
                  {challenge.starred && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {challenge.description}
                  </p>
                </div>
              </div>
              
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full border font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
                <span className="text-gray-600 dark:text-gray-400 font-medium">{challenge.language}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
                  <Zap className="w-3 h-3" />
                  {challenge.points}
                </span>
                <span className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                  <Clock className="w-3 h-3" />
                  {challenge.timeLimit}m
                </span>
                <span className="flex items-center gap-1 hover:text-green-500 transition-colors">
                  <TrendingUp className="w-3 h-3" />
                  {challenge.successRate}%
                </span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {challenge.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-700">
                  {tag}
                </span>
              ))}
              {challenge.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  +{challenge.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}); // Fixed missing parenthesis for React.memo

// Enhanced CodeEditor Component - Optimized with memo
const CodeEditor = React.memo(({ challenge }) => {
  const [code, setCode] = useState(`// ${challenge.title}\n// ${challenge.description}\n\nfunction solution() {\n    // Write your solution here\n    \n}\n\n// Test your solution\nconsole.log(solution());`);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('problem');
  const [timeRemaining, setTimeRemaining] = useState(challenge.timeLimit * 60);

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setResults({
        success: Math.random() > 0.3,
        testsPassed: Math.floor(Math.random() * 8) + 2,
        totalTests: 10,
        executionTime: `${Math.floor(Math.random() * 100) + 20}ms`,
        memoryUsed: `${(Math.random() * 3 + 1).toFixed(1)}MB`,
        score: Math.floor(Math.random() * 40) + 60
      });
      setIsRunning(false);
    }, 2000);
  };

  const resetCode = () => {
    setCode(`// ${challenge.title}\n// ${challenge.description}\n\nfunction solution() {\n    // Write your solution here\n    \n}\n\n// Test your solution\nconsole.log(solution());`);
    setResults(null);
  };

  const tabs = [
    { id: 'problem', label: 'Problem', icon: BookOpen },
    { id: 'solution', label: 'Solution', icon: Code },
    { id: 'discussions', label: 'Discussions', icon: Users },
    { id: 'submissions', label: 'Submissions', icon: Trophy }
  ];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-rose-600/20 animate-pulse"></div>
        
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm ${challenge.difficulty === 'Easy' ? 'text-green-300' : challenge.difficulty === 'Medium' ? 'text-yellow-300' : 'text-red-300'}`}>
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                {challenge.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {challenge.points} points
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {formatTime(timeRemaining)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {challenge.attempts} attempts
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-lg font-medium text-sm ${
              timeRemaining > 300 ? 'bg-green-500/20 text-green-300' :
              timeRemaining > 60 ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {formatTime(timeRemaining)}
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white backdrop-blur-sm' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col h-full">
        {activeTab === 'problem' && (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">{challenge.title}</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">{challenge.description}</p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Example:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                <code>{challenge.example}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Main ChallengePage Component
const ChallengePage = React.memo(() => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challenges, setChallenges] = useState(mockChallenges);
  const [stats, setStats] = useState({
    totalChallenges: challenges.length,
    completedChallenges: challenges.filter(c => c.completed).length,
    totalPoints: challenges.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0),
    averageScore: challenges.filter(c => c.completed).reduce((sum, c) => sum + c.bestScore, 0) / challenges.filter(c => c.completed).length || 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleSelectChallenge = useCallback((challenge) => {
    setSelectedChallenge(challenge);
  }, []);

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  // Memoized filtered challenges based on search and filters
  const filteredChallenges = useMemo(() => {
    return challenges;
  }, [challenges]);

  // Fetch challenges from API
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Uncomment this when API is ready
        // const response = await fetch('/api/challenges');
        // if (!response.ok) throw new Error('Failed to fetch challenges');
        // const data = await response.json();
        // setChallenges(data);

        // Using mock data for now
        setTimeout(() => {
          setChallenges(mockChallenges);
          setIsLoading(false);
        }, 500); // Simulate API delay
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  useEffect(() => {
    // Auto-select first challenge if none selected
    if (!selectedChallenge && challenges.length > 0) {
      setSelectedChallenge(challenges[0]);
    }
  }, [challenges, selectedChallenge]);

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Error</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                    Code Challenges
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Practice your coding skills with real-world problems
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.totalChallenges}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Total
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.completedChallenges}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.totalPoints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" />
                  Points
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {Math.round(stats.averageScore)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Avg Score
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Achievement Banner */}
        <div className="mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-1 rounded-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">🎉 Achievement Unlocked!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete 3 more challenges to earn the "Problem Solver" badge</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">2/5</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Challenge List */}
          <div className="xl:col-span-1">
            <ChallengeList 
              challenges={challenges}
              onSelectChallenge={handleSelectChallenge}
              selectedChallenge={selectedChallenge}
            />
          </div>
          
          {/* Code Editor */}
          <div className="xl:col-span-2">
            {selectedChallenge ? (
              <CodeEditor challenge={selectedChallenge} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 dark:from-gray-700 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Select a Challenge
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Choose a coding challenge from the list to start practicing your programming skills.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 rounded-full text-sm border border-green-200 dark:border-green-700">
                    Easy
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm border border-yellow-200 dark:border-yellow-700">
                    Medium
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 rounded-full text-sm border border-red-200 dark:border-red-700">
                    Hard
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">7 Day Streak</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Keep it up!</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">Advanced</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Skill Level</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">Rank #1,234</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Global Ranking</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default ChallengePage;