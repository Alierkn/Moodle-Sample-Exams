import React, { useState, useEffect } from 'react';
import { 
  User, Trophy, Calendar, Award, TrendingUp, Target, 
  Code, Flame, Star, Edit3, Settings, Share2, Download,
  Activity, Clock, CheckCircle, XCircle, Zap, Crown,
  BookOpen, Github, ExternalLink, Mail, MapPin, Globe
} from 'lucide-react';

// Mock services and contexts
const getUserProfile = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    user: {
      id: 1,
      username: 'CodeMaster',
      email: 'codemaster@example.com',
      points: 2850,
      streak: 12,
      level: 'Advanced',
      badge: 'Gold',
      avatar: null,
      bio: 'Passionate developer who loves solving complex problems and learning new technologies.',
      location: 'San Francisco, CA',
      website: 'https://codemaster.dev',
      github: 'codemaster',
      joined_date: '2023-01-15',
      last_active: '2024-06-12T10:30:00Z',
      statistics: {
        total_challenges: 45,
        completed_challenges: 38,
        success_rate: 84,
        avg_completion_time: 15.5,
        challenges_by_language: {
          'JavaScript': { completed: 15, total: 18 },
          'Python': { completed: 12, total: 15 },
          'React': { completed: 8, total: 10 },
          'Node.js': { completed: 3, total: 2 }
        },
        challenges_by_difficulty: {
          'Easy': { completed: 20, total: 22 },
          'Medium': { completed: 15, total: 18 },
          'Hard': { completed: 3, total: 5 }
        }
      },
      recent_activities: [
        {
          id: 1,
          title: 'Binary Tree Traversal',
          language: 'Python',
          difficulty: 'Medium',
          completed_at: '2024-06-12T09:15:00Z',
          points: 150,
          time_taken: 18
        },
        {
          id: 2,
          title: 'React Component Optimization',
          language: 'React',
          difficulty: 'Hard',
          completed_at: '2024-06-11T16:45:00Z',
          points: 250,
          time_taken: 35
        },
        {
          id: 3,
          title: 'Array Manipulation',
          language: 'JavaScript',
          difficulty: 'Easy',
          completed_at: '2024-06-11T14:20:00Z',
          points: 100,
          time_taken: 8
        },
        {
          id: 4,
          title: 'API Integration',
          language: 'Node.js',
          difficulty: 'Medium',
          completed_at: null,
          points: 0,
          time_taken: 0
        },
        {
          id: 5,
          title: 'Database Query Optimization',
          language: 'SQL',
          difficulty: 'Hard',
          completed_at: '2024-06-10T11:30:00Z',
          points: 300,
          time_taken: 42
        }
      ],
      achievements: [
        { name: 'First Blood', description: 'Complete your first challenge', unlocked: true },
        { name: 'Speed Demon', description: 'Complete 5 challenges in under 10 minutes', unlocked: true },
        { name: 'Streak Master', description: 'Maintain a 10-day streak', unlocked: true },
        { name: 'Language Explorer', description: 'Complete challenges in 5 different languages', unlocked: false },
        { name: 'Perfect Score', description: 'Get 100% on 10 hard challenges', unlocked: false }
      ]
    }
  };
};

const useToast = () => ({
  showSuccess: (message) => console.log('Success:', message),
  showError: (message) => console.log('Error:', message)
});

// Enhanced Skeleton Components
const ProfileSkeleton = ({ className }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-48 mb-4"></div>
      <div className="flex gap-4">
        <div className="text-center">
          <div className="h-6 bg-gray-300 rounded w-12 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="text-center">
          <div className="h-6 bg-gray-300 rounded w-12 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
);

const CardSkeleton = ({ className, lines = 3 }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
    {Array(lines).fill(0).map((_, i) => (
      <div key={i} className="h-3 bg-gray-300 rounded w-full mb-2"></div>
    ))}
  </div>
);

/**
 * Modern Enhanced Profile Page Component
 */
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const profileResult = await getUserProfile();
      if (profileResult.success) {
        setProfile(profileResult.user);
        showSuccess('Profile loaded successfully');
      } else {
        setError(profileResult.message || 'Failed to load profile');
        showError(profileResult.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('An unexpected error occurred');
      showError('An unexpected error occurred while loading your profile');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelInfo = (points) => {
    if (points >= 5000) return { level: 'Expert', color: 'from-purple-500 to-pink-500', icon: Crown };
    if (points >= 2000) return { level: 'Advanced', color: 'from-blue-500 to-cyan-500', icon: Star };
    if (points >= 500) return { level: 'Intermediate', color: 'from-green-500 to-emerald-500', icon: Trophy };
    return { level: 'Beginner', color: 'from-gray-500 to-gray-600', icon: Target };
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProfileSkeleton className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl" />
            <CardSkeleton className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl" lines={5} />
            <CardSkeleton className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl" lines={6} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchUserData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">Unable to locate your profile information.</p>
        </div>
      </div>
    );
  }

  const statistics = profile.statistics || {};
  const totalChallenges = statistics.total_challenges || 0;
  const completedChallenges = statistics.completed_challenges || 0;
  const successRate = statistics.success_rate || 0;
  const challengesByLanguage = statistics.challenges_by_language || {};
  const challengesByDifficulty = statistics.challenges_by_difficulty || {};
  const levelInfo = getLevelInfo(profile.points);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Your Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your progress and achievements</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Share2 size={18} />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Download size={18} />
              Export
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Edit3 size={18} />
              Edit
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/30">
            <div className="text-center relative">
              {/* Background decoration */}
              <div className={`absolute inset-0 bg-gradient-to-r ${levelInfo.color} opacity-5 rounded-2xl`} />
              
              {/* Avatar */}
              <div className="relative mb-6">
                <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${levelInfo.color} flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-2xl`}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profile.username ? profile.username.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* Level badge */}
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${levelInfo.color} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                  <levelInfo.icon size={14} className="inline mr-1" />
                  {levelInfo.level}
                </div>
              </div>
              
              {/* User info */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{profile.username || 'User'}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{profile.email}</p>
              
              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed">{profile.bio}</p>
              )}
              
              {/* Contact info */}
              <div className="space-y-2 mb-6">
                {profile.location && (
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <MapPin size={14} />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                    <Globe size={14} />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {profile.website.replace('https://', '')}
                    </a>
                  </div>
                )}
                {profile.github && (
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <Github size={14} />
                    <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      @{profile.github}
                    </a>
                  </div>
                )}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.points}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Points</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                    <Flame size={20} />
                    {profile.streak || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{successRate}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Success</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={24} />
                Progress Overview
              </h2>
            </div>
            
            {/* Overall progress */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{completedChallenges}/{totalChallenges}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: totalChallenges > 0 ? `${(completedChallenges / totalChallenges) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0}% completed
              </p>
            </div>
            
            {/* By Difficulty */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">By Difficulty</h3>
              {Object.entries(challengesByDifficulty).map(([difficulty, stats]) => (
                <div key={difficulty} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.completed}/{stats.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                        difficulty === 'Easy' ? 'bg-green-500' :
                        difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{statistics.avg_completion_time || 0}m</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Avg Time</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Trophy className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-700 dark:text-green-300">{profile.achievements?.filter(a => a.unlocked).length || 0}</div>
                <div className="text-xs text-green-600 dark:text-green-400">Achievements</div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="text-green-500" size={24} />
                Recent Activity
              </h2>
            </div>
            
            {totalChallenges === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No challenges attempted yet.</p>
                <button className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300">
                  Start Your First Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {profile.recent_activities && profile.recent_activities.slice(0, 8).map((activity, index) => (
                  <div 
                    key={activity.id || index} 
                    className="group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {activity.completed_at ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          )}
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {activity.title || 'Challenge'}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Code size={14} />
                            {activity.language || 'Unknown'}
                          </span>
                          {activity.difficulty && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                              {activity.difficulty}
                            </span>
                          )}
                          {activity.time_taken > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {activity.time_taken}m
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Zap size={14} className="text-yellow-500" />
                          {activity.points || 0} pts
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.completed_at ? formatTimeAgo(activity.completed_at) : 'In progress'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {totalChallenges > 8 && (
              <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium hover:underline transition-colors">
                  View All Activities →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Language Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-8 border border-white/20 dark:border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Code className="text-purple-500" size={28} />
              Languages & Technologies
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(challengesByLanguage).map(([language, stats]) => {
              const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
              const isComplete = progress === 100;
              
              return (
                <div key={language} className="group p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {language}
                    </h3>
                    {isComplete && <Crown className="w-5 h-5 text-yellow-500" />}
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{stats.completed}/{stats.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                          isComplete ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ width: `${progress}%` }}