import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Add auth token to requests if available
api.interceptors.request.use(config => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized errors
            if (error.response.status === 401) {
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

// Code execution API
const runCode = async (code, language, expectedOutput = null, additionalParams = {}) => {
  try {
    const response = await api.post('/run-code', {
      code,
      language,
      expectedOutput,
      ...additionalParams
    });
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during the API call',
      output: '',
      executionTime: 0,
      memoryUsage: 0,
      testsPassed: 0,
      totalTests: 0,
      details: []
    };
  }
};

// Authentication APIs
const login = async (username, password) => {
  return await api.post('/login', { username, password });
};

const register = async (username, email, password) => {
  return await api.post('/register', { username, email, password });
};

const logout = async () => {
  return await api.get('/logout');
};

const verifyToken = async () => {
  return await api.get('/user/verify');
};

const refreshToken = async () => {
  return await api.post('/user/refresh-token');
};

const getUserProfile = async () => {
  return await api.get('/user/profile');
};

// Challenges APIs
const getChallenges = async () => {
  try {
    const response = await api.get('/challenges');
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, challenges: [] };
  }
};

const getChallenge = async (challengeId) => {
  try {
    const response = await api.get(`/challenges/${challengeId}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, challenge: null };
  }
};

const submitChallenge = async (challengeId, code, language) => {
  try {
    const response = await api.post(`/challenges/${challengeId}/submit`, {
      code,
      language
    });
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to submit challenge',
      allTestsPassed: false,
      testResults: []
    };
  }
};

const getUserProgress = async () => {
  try {
    const response = await api.get('/user/progress');
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, progress: [] };
  }
};

// Leaderboard API
const getLeaderboard = async () => {
  try {
    const response = await api.get('/leaderboard');
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, leaderboard: [] };
  }
};

// Resources APIs
const getResources = async () => {
  try {
    const response = await axios.get(`${API_URL}/resources`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { success: false, error: error.message };
  }
};

const getFavorites = async () => {
  try {
    const response = await api.get('/user/favorites');
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, favorites: [] };
  }
};

const toggleFavorite = async (resourceId) => {
  return await api.post('/user/favorites/toggle', { resource_id: resourceId });
};

// File upload API
const uploadResource = async (formData) => {
  try {
    const response = await api.post('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'File upload failed'
    };
  }
};

// Notes APIs
const getNotes = async () => {
  try {
    const response = await api.get('/notes');
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, notes: [] };
  }
};

const getUserNotes = async () => {
  try {
    const response = await api.get('/notes/user');
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, notes: [] };
  }
};

const getNote = async (noteId) => {
  try {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, note: null };
  }
};

const createNote = async (noteData) => {
  try {
    const response = await api.post('/notes', noteData);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to create note' };
  }
};

const updateNote = async (noteId, noteData) => {
  try {
    const response = await api.put(`/notes/${noteId}`, noteData);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update note' };
  }
};

const deleteNote = async (noteId) => {
  try {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to delete note' };
  }
};

const toggleNoteLike = async (noteId) => {
  try {
    const response = await api.post(`/notes/${noteId}/like`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to like/unlike note' };
  }
};

const searchNotes = async (query) => {
  try {
    const response = await api.get(`/notes/search/${query}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    return { success: false, notes: [] };
  }
};

// Export all API functions
const apiService = {
  runCode,
  login,
  register,
  logout,
  verifyToken,
  refreshToken,
  getUserProfile,
  getChallenges,
  getChallenge,
  submitChallenge,
  getUserProgress,
  getLeaderboard,
  getResources,
  getFavorites,
  toggleFavorite,
  uploadResource,
  // Notes APIs
  getNotes,
  getUserNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  toggleNoteLike,
  searchNotes
};

export default apiService;
