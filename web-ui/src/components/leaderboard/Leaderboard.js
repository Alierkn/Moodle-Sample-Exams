import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Zap, Award, User } from 'lucide-react';
import api from '../../services/api';

export default function Leaderboard({ leaderboardData = [], currentUser }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month'
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await api.getLeaderboard();
        
        if (response.success && response.leaderboard) {
          // Zaman aralığına göre filtreleme yapabiliriz
          let filteredLeaderboard = [...response.leaderboard];
          
          if (timeRange === 'week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            // Bu kısım gerçek verilerle çalışacak şekilde düzenlenebilir
            // Şimdilik tüm verileri gösteriyoruz
          } else if (timeRange === 'month') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            // Bu kısım gerçek verilerle çalışacak şekilde düzenlenebilir
            // Şimdilik tüm verileri gösteriyoruz
          }
          
          setFilteredData(filteredLeaderboard);
        } else {
          setFilteredData([]);
          setError('Leaderboard verisi alınamadı.');
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Leaderboard verisi yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeRange]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-700 border-b border-gray-600 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-white">Sıralama Tablosu</h2>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeRange('all')} 
            className={`px-3 py-1 rounded ${timeRange === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Tüm Zamanlar
          </button>
          <button 
            onClick={() => setTimeRange('month')} 
            className={`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Bu Ay
          </button>
          <button 
            onClick={() => setTimeRange('week')} 
            className={`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Bu Hafta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-400">Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-400">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Challenges</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Streak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Active</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredData.map((user, index) => {
                const isCurrentUser = currentUser && user.id === currentUser.id;
                return (
                  <tr 
                    key={user.id || index} 
                    className={`hover:bg-gray-700 ${isCurrentUser ? 'bg-blue-900 bg-opacity-30' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mr-2" />}
                        {index === 1 && <Trophy className="h-5 w-5 text-gray-400 mr-2" />}
                        {index === 2 && <Trophy className="h-5 w-5 text-yellow-800 mr-2" />}
                        <span className="text-sm font-medium text-white">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                          <span className="font-bold text-sm text-white">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="text-sm font-medium text-white">
                          {user.username}
                          {isCurrentUser && <span className="ml-2 text-xs bg-blue-600 px-2 py-0.5 rounded">Siz</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-sm text-white">{user.points}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{user.challengesCompleted || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-purple-500 mr-2" />
                        <span className="text-sm text-white">{user.streak || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {user.lastAttemptDate ? new Date(user.lastAttemptDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    No data available for the selected time range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="p-4 bg-gray-700 border-t border-gray-600">
        <div className="text-sm text-gray-400">
          <p>Compete with other students by solving challenges and maintaining your streak!</p>
          <p className="mt-1">Points are earned by completing challenges based on difficulty.</p>
        </div>
      </div>
    </div>
  );
}
