import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../../services/supabaseService';

/**
 * Profile page component
 * Displays user information and statistics
 */
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch enhanced user profile with statistics
      const profileResult = await getUserProfile();
      if (profileResult.success) {
        setProfile(profileResult.user);
      } else {
        setError(profileResult.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={fetchUserData}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Profile not found.</p>
      </div>
    );
  }

  // Get statistics from the enhanced profile
  const statistics = profile.statistics || {};
  const totalChallenges = statistics.total_challenges || 0;
  const completedChallenges = statistics.completed_challenges || 0;
  const totalPoints = profile.points || 0;
  const challengesByLanguage = statistics.challenges_by_language || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {profile.username ? profile.username.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold">{profile.username || 'User'}</h2>
            <p className="text-gray-600">{profile.email}</p>
            
            <div className="mt-6 flex justify-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalPoints}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.streak || 0}</div>
                <div className="text-sm text-gray-600">Streak</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Challenge Stats */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Challenge Progress</h2>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Completed</span>
              <span className="text-sm font-medium">{completedChallenges}/{totalChallenges}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: totalChallenges > 0 ? `${(completedChallenges / totalChallenges) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
          
          <h3 className="text-md font-bold mt-6 mb-2">By Language</h3>
          {Object.entries(challengesByLanguage).map(([language, stats]) => (
            <div key={language} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{language}</span>
                <span className="text-sm font-medium">{stats.completed}/{stats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          
          {totalChallenges === 0 ? (
            <p className="text-gray-600">No challenges attempted yet.</p>
          ) : (
            <div className="space-y-4">
              {profile.recent_activities && profile.recent_activities.slice(0, 5).map((activity, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{activity.title || 'Challenge'}</h3>
                      <p className="text-sm text-gray-600">{activity.language || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm ${activity.completed_at ? 'text-green-600' : 'text-red-600'}`}>
                        {activity.completed_at ? 'Completed' : 'Attempted'}
                      </span>
                      <p className="text-sm text-gray-600">{activity.points || 0} pts</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {totalChallenges > 5 && (
                <div className="text-center mt-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View All Activities
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
