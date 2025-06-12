import React, { useState, useEffect } from 'react';
import { Code, Database, Trophy, BookOpen, Home, LogOut, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './dashboard/Dashboard';
import CodeEditor from './editor/CodeEditor';
import Challenges from './challenges/Challenges';
import Leaderboard from './leaderboard/Leaderboard';
import Resources from './resources/Resources';
import Notes from './notes/Notes';
import apiService from '../services/api';

export default function MoodleExamPlatform({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('challenges');
  const [stats, setStats] = useState({
    totalTests: 0,
    successRate: 0,
    avgTime: 0,
    streak: user?.streak || 0,
    points: user?.points || 0,
    solvedChallenges: 0
  });

  // State for test results and challenges
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resourceRefreshTrigger, setResourceRefreshTrigger] = useState(0);
  const [refreshNotes, setRefreshNotes] = useState(false);

  // Fetch user stats, challenges, and leaderboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user profile data
        const profileResponse = await apiService.getUserProfile();
        if (profileResponse.data.success) {
          const userData = profileResponse.data.user;
          setStats(prev => ({
            ...prev,
            streak: userData.streak || 0,
            points: userData.points || 0,
            solvedChallenges: userData.solved_challenges?.length || 0
          }));
        }
        
        // Fetch challenges
        const challengesResponse = await apiService.getChallenges();
        if (challengesResponse.success) {
          setChallenges(challengesResponse.challenges);
        }
        
        // Fetch leaderboard
        const leaderboardResponse = await apiService.getLeaderboard();
        if (leaderboardResponse.success) {
          setLeaderboardData(leaderboardResponse.leaderboard);
        }
        
        // Fetch resources
        const resourcesResponse = await apiService.getResources();
        if (resourcesResponse.success) {
          setResources(resourcesResponse.resources);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          onLogout();
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, navigate, onLogout, resourceRefreshTrigger]);

  // Update stats when test results change
  useEffect(() => {
    if (testResults) {
      const success = testResults.success;
      
      setStats(prev => ({
        ...prev,
        totalTests: prev.totalTests + 1,
        successRate: Math.round(((prev.totalTests * prev.successRate/100) + (success ? 1 : 0)) / (prev.totalTests + 1) * 100),
        avgTime: Math.floor((prev.avgTime * prev.totalTests + (testResults.executionTime || 200)) / (prev.totalTests + 1)),
        streak: success ? prev.streak + 1 : 0,
        points: prev.points + (testResults.points_earned || 0)
      }));

      // If a challenge was completed, refresh challenges and leaderboard
      if (testResults.points_earned) {
        apiService.getChallenges()
          .then(response => {
            if (response.success) {
              setChallenges(response.challenges);
              const solved = response.challenges.filter(challenge => challenge.solved).length;
              setStats(prev => ({ ...prev, solvedChallenges: solved }));
            }
          });
        
        apiService.getLeaderboard()
          .then(response => {
            if (response.success) {
              setLeaderboardData(response.leaderboard);
            }
          });
      }
    }
  }, [testResults]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiService.logout();
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
      onLogout(); // Logout anyway even if API fails
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-green-500" />
            <h1 className="text-xl font-bold">Moodle Exam Simulator</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-yellow-500 font-bold">{stats.points}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Welcome, {user.username}</span>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="font-bold text-sm">{user.username.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 py-2 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleTabChange('editor')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'editor' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Code className="h-4 w-4" />
              <span>Code Editor</span>
            </button>
            <button
              onClick={() => handleTabChange('challenges')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'challenges' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Database className="h-4 w-4" />
              <span>Challenges</span>
            </button>
            <button
              onClick={() => handleTabChange('leaderboard')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'leaderboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => handleTabChange('resources')}
              className={`px-4 py-2 rounded-md ${activeTab === 'resources' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Resources
            </button>
            <button
              onClick={() => handleTabChange('notes')}
              className={`px-4 py-2 rounded-md ${activeTab === 'notes' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Notes
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 px-6 py-4 rounded-lg flex items-center">
            <AlertCircle className="h-6 w-6 mr-2" />
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard 
              stats={stats} 
              setActiveTab={setActiveTab} 
              user={user} 
            />}
            {activeTab === 'editor' && <CodeEditor 
              testResults={testResults} 
              isRunning={isRunning} 
              setTestResults={setTestResults} 
              setIsRunning={setIsRunning} 
              user={user}
            />}
            {activeTab === 'challenges' && <Challenges 
              challenges={challenges} 
              user={user} 
              setTestResults={setTestResults}
              setActiveTab={setActiveTab}
            />}
            {activeTab === 'leaderboard' && <Leaderboard 
              leaderboardData={leaderboardData}
              currentUser={user}
            />}
            {activeTab === 'resources' && (
              <Resources user={user} onResourceUpdate={() => setResourceRefreshTrigger(prev => prev + 1)} />
            )}
            {activeTab === 'notes' && (
              <Notes user={user} key={refreshNotes} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
