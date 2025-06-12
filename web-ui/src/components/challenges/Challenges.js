import React, { useState, useEffect } from 'react';
import { Database, Filter, CheckCircle, Clock, AlertCircle, Award, ArrowRight, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

export default function Challenges({ challenges = [], user, setTestResults, setActiveTab }) {
  const [loading, setLoading] = useState(challenges.length === 0);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'easy', 'medium', 'hard'
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (challenges.length > 0) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await apiService.getChallenges();
        if (response.success) {
          setFilteredChallenges(response.challenges);
        } else {
          setError(response.message || 'Failed to load challenges');
        }
      } catch (err) {
        console.error('Error fetching challenges:', err);
        setError(err.response?.data?.message || 'Error loading challenges.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, [challenges]);

  useEffect(() => {
    if (challenges.length > 0) {
      if (filter === 'all') {
        setFilteredChallenges(challenges);
      } else {
        setFilteredChallenges(challenges.filter(challenge => 
          challenge.difficulty.toLowerCase() === filter.toLowerCase()
        ));
      }
    }
  }, [filter, challenges]);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const startChallenge = (challenge) => {
    localStorage.setItem('currentChallenge', JSON.stringify(challenge));
    setTestResults(null); // Reset any previous test results
    
    // If we're using tabs instead of routes, switch to editor tab
    if (setActiveTab) {
      setActiveTab('editor');
    } else {
      navigate('/editor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">Challenges</h2>
        </div>
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 ${filter === 'all' ? 'bg-blue-700' : 'bg-gray-800'} text-white rounded-lg hover:bg-gray-700 transition-all`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 ${filter === 'easy' ? 'bg-green-700' : 'bg-gray-800'} text-white rounded-lg hover:bg-gray-700 transition-all`}
            onClick={() => setFilter('easy')}
          >
            Easy
          </button>
          <button 
            className={`px-4 py-2 ${filter === 'medium' ? 'bg-yellow-700' : 'bg-gray-800'} text-white rounded-lg hover:bg-gray-700 transition-all`}
            onClick={() => setFilter('medium')}
          >
            Medium
          </button>
          <button 
            className={`px-4 py-2 ${filter === 'hard' ? 'bg-red-700' : 'bg-gray-800'} text-white rounded-lg hover:bg-gray-700 transition-all`}
            onClick={() => setFilter('hard')}
          >
            Hard
          </button>
        </div>
      </div>

      {/* User Progress Summary */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-300">Completed</span>
            </div>
            <span className="text-white font-bold">
              {filteredChallenges.filter(c => c.solved).length} / {filteredChallenges.length}
            </span>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-gray-300">Points Earned</span>
            </div>
            <span className="text-white font-bold">{user?.points || 0}</span>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-gray-300">Current Streak</span>
            </div>
            <span className="text-white font-bold">{user?.streak || 0} days</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-400">No challenges found for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => (
            <div 
              key={challenge.id || challenge._id} 
              className={`bg-gray-800 rounded-lg border overflow-hidden transition-all ${challenge.solved ? 'border-green-500' : 'border-gray-700 hover:border-blue-500'}`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-lg">{challenge.title}</h3>
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${challenge.difficulty === 'Easy' ? 'bg-green-900 text-green-300' : challenge.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}
                  >
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="text-gray-400 mt-2 text-sm">{challenge.description}</p>
                
                <div className="mt-3 flex items-center">
                  <div className="flex items-center mr-4">
                    <Code className="h-4 w-4 text-blue-400 mr-1" />
                    <span className="text-sm text-gray-400">{challenge.language}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-400">{challenge.points} pts</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 px-4 py-3 flex justify-between items-center">
                {challenge.solved ? (
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-300">Not completed</div>
                )}
                <button 
                  className={`flex items-center ${challenge.solved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-1 rounded text-sm transition-all`}
                  onClick={() => startChallenge(challenge)}
                >
                  {challenge.solved ? 'Review Solution' : 'Start Challenge'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Challenge Levels Explanation */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Challenge Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300 mr-2">Easy</span>
              <span className="text-white">Beginner Friendly</span>
            </div>
            <p className="text-sm text-gray-400">Basic concepts and simple problems. Perfect for getting started.</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-900 text-yellow-300 mr-2">Medium</span>
              <span className="text-white">Intermediate</span>
            </div>
            <p className="text-sm text-gray-400">More complex problems requiring deeper understanding of concepts.</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <span className="px-2 py-1 text-xs rounded-full bg-red-900 text-red-300 mr-2">Hard</span>
              <span className="text-white">Advanced</span>
            </div>
            <p className="text-sm text-gray-400">Challenging problems that test your mastery of the subject.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
