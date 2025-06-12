import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Zap, Target, TrendingUp, Award, Code, Trophy, Users, BookOpen } from 'lucide-react';
import UserProfile from '../profile/UserProfile';

export default function Dashboard({ stats, setActiveTab, user }) {
  const [showProfile, setShowProfile] = useState(false);
  const notifications = [
    { id: 1, type: 'success', message: 'New challenge added: SQL Advanced Queries', time: '5 minutes ago' },
    { id: 2, type: 'info', message: 'Live practice session tomorrow at 14:00', time: '1 hour ago' },
    { id: 3, type: 'warning', message: 'Exam date approaching: 3 days left', time: '2 hours ago' }
  ];

  return (
    <div className="space-y-8">
      {/* Profile Toggle Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          {showProfile ? 'Hide Profile' : 'View Profile'}
        </button>
      </div>

      {/* User Profile */}
      {showProfile && (
        <div className="mb-8">
          <UserProfile user={user} />
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Tests</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalTests}</h3>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-green-500 text-sm flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> 
              {stats.totalTests > 0 ? '+1 today' : '0'}
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <h3 className="text-2xl font-bold text-white">{stats.successRate}%</h3>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${stats.successRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average Time</p>
              <h3 className="text-2xl font-bold text-white">{stats.avgTime} ms</h3>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">
              {stats.avgTime < 200 ? 'Great performance!' : stats.avgTime < 500 ? 'Good performance' : 'Optimization needed'}
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Streak</p>
              <h3 className="text-2xl font-bold text-white">{stats.streak} 🔥</h3>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-purple-400 text-sm">
              {stats.streak > 5 ? 'Excellent streak!' : stats.streak > 0 ? 'Keep going!' : 'Start a new streak'}
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Points Earned</p>
              <h3 className="text-2xl font-bold text-white">{stats.points}</h3>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Award className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-yellow-400 text-sm">
              {stats.points > 1000 ? 'Expert level!' : stats.points > 500 ? 'Intermediate level' : 'Keep earning points'}
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Challenges Solved</p>
              <h3 className="text-2xl font-bold text-white">{stats.solvedChallenges}</h3>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-green-400 text-sm">
              {stats.solvedChallenges > 10 ? 'Challenge master!' : stats.solvedChallenges > 0 ? 'Making progress!' : 'Start solving challenges'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {notifications.map(notif => (
            <div key={notif.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {notif.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500" />}
                {notif.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                <span className="text-gray-300">{notif.message}</span>
              </div>
              <span className="text-gray-500 text-sm">{notif.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('editor')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center gap-3"
        >
          <Code className="w-12 h-12" />
          <span className="font-semibold">Code Editor</span>
        </button>
        
        <button
          onClick={() => setActiveTab('challenges')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-6 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center gap-3"
        >
          <Trophy className="w-12 h-12" />
          <span className="font-semibold">Challenges</span>
        </button>
        
        <button
          onClick={() => setActiveTab('leaderboard')}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-6 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center gap-3"
        >
          <Users className="w-12 h-12" />
          <span className="font-semibold">Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-6 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center gap-3"
        >
          <BookOpen className="w-12 h-12" />
          <span className="font-semibold">Resources</span>
        </button>
      </div>
    </div>
  );
}
