import React, { useState, useEffect } from 'react';
import { User, Award, Calendar, Clock } from 'lucide-react';
import apiService from '../../services/api';

const UserProfile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solvedChallenges, setSolvedChallenges] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await apiService.getUserProfile();
        if (response.data.success) {
          setProfile(response.data.profile);
          setSolvedChallenges(response.data.solved_challenges || []);
        } else {
          setError(response.data.message || 'Failed to load profile');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{user.username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
            <Award className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-gray-400 text-sm">Points</p>
              <p className="text-xl font-bold text-white">{profile?.points || 0}</p>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-gray-400 text-sm">Current Streak</p>
              <p className="text-xl font-bold text-white">{profile?.streak || 0} days</p>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-gray-400 text-sm">Member Since</p>
              <p className="text-xl font-bold text-white">{formatDate(profile?.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Activity Summary</h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Challenges Solved</span>
              <span className="text-white font-bold">{solvedChallenges.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Last Activity</span>
              <span className="text-white">{formatDate(profile?.last_activity)}</span>
            </div>
          </div>
        </div>

        {solvedChallenges.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Recent Solved Challenges</h3>
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Challenge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Solved On</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-700 divide-y divide-gray-600">
                  {solvedChallenges.slice(0, 5).map((challenge, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{challenge.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${challenge.difficulty === 'Easy' ? 'bg-green-800 text-green-200' : 
                            challenge.difficulty === 'Medium' ? 'bg-yellow-800 text-yellow-200' : 
                            'bg-red-800 text-red-200'}`}>
                          {challenge.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{challenge.points}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{formatDate(challenge.solved_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
