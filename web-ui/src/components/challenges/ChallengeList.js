import React, { useState, useEffect } from 'react';
import { getChallenges } from '../../services/supabaseService';

/**
 * Challenge list component
 * Displays a list of available coding challenges
 */
const ChallengeList = ({ onSelectChallenge }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    language: 'all',
    difficulty: 'all',
    search: ''
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const result = await getChallenges();
      
      if (result.success) {
        setChallenges(result.challenges || []);
      } else {
        setError(result.message || 'Failed to load challenges');
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const filteredChallenges = challenges.filter(challenge => {
    // Filter by language
    if (filter.language !== 'all' && challenge.language !== filter.language) {
      return false;
    }
    
    // Filter by difficulty
    if (filter.difficulty !== 'all' && challenge.difficulty !== filter.difficulty) {
      return false;
    }
    
    // Filter by search term
    if (filter.search && !challenge.title.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageColor = (language) => {
    switch (language.toLowerCase()) {
      case 'python':
        return 'bg-blue-100 text-blue-800';
      case 'neo4j':
        return 'bg-purple-100 text-purple-800';
      case 'mongodb':
        return 'bg-green-100 text-green-800';
      case 'sql':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Coding Challenges</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Coding Challenges</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={fetchChallenges}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Coding Challenges</h2>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="language">
            Language
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="language"
            name="language"
            value={filter.language}
            onChange={handleFilterChange}
          >
            <option value="all">All Languages</option>
            <option value="python">Python</option>
            <option value="neo4j">Neo4j</option>
            <option value="mongodb">MongoDB</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="difficulty">
            Difficulty
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="difficulty"
            name="difficulty"
            value={filter.difficulty}
            onChange={handleFilterChange}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="search">
            Search
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="search"
            name="search"
            type="text"
            placeholder="Search challenges..."
            value={filter.search}
            onChange={handleFilterChange}
          />
        </div>
      </div>
      
      {/* Challenge Cards */}
      {filteredChallenges.length === 0 ? (
        <p className="text-gray-600">No challenges found matching your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => (
            <div 
              key={challenge.id} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectChallenge(challenge)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{challenge.title}</h3>
                  <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {challenge.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${getLanguageColor(challenge.language)}`}>
                    {challenge.language}
                  </span>
                  
                  <div className="text-sm text-gray-600">
                    <span className="mr-2">{challenge.points} points</span>
                    <span>{challenge.completedBy || 0} solved</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={fetchChallenges}
        >
          Refresh Challenges
        </button>
      </div>
    </div>
  );
};

export default ChallengeList;
