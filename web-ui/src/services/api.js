import axios from 'axios';

// Determine if we're running in production (on netlify.app domain)
const isProduction = window.location.hostname.includes('netlify.app');

// Use environment variables if available, or choose appropriate default based on environment
// For production, we'll use a deployed API or fallback to mock data handling
const API_URL = process.env.REACT_APP_API_URL || 
  (isProduction ? 'https://moodle-exam-api.herokuapp.com/api' : 'http://localhost:5000/api');
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

// Configure axios with exponential backoff retry mechanism
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000 // 10 second timeout
});

// Configure retry mechanism
let retryDelay = 100; // Start with 100ms delay
const maxRetries = 3;

// Add auth token to requests if available
api.interceptors.request.use(config => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Handle response errors with retry capability
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Only retry on network errors or 5xx server errors
        if ((error.response?.status >= 500 || !error.response) && 
            !originalRequest._retry && 
            originalRequest.retryCount < maxRetries) {
            
            originalRequest._retry = true;
            originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;
            
            // Exponential backoff
            const delay = retryDelay * (2 ** originalRequest.retryCount) + (Math.random() * 100);
            console.log(`Retrying request (${originalRequest.retryCount}/${maxRetries}) after ${delay}ms`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return api(originalRequest);
        }
        
        // Handle authentication errors
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        // Log error details
        if (error.response) {
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
      error: error.response?.data?.message || 'Failed to run code'
    };
  }
};

// Auth APIs
const register = async (username, email, password) => {
  try {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Registration failed' };
  }
};

const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Login failed' };
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user') || '{}');
};

// Challenge APIs
const getChallenges = async () => {
  try {
    const response = await api.get('/challenges');
    return {
      success: true,
      challenges: response.data.challenges
    };
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch challenges'
    };
  }
};

const getChallenge = async (id) => {
  try {
    const response = await api.get(`/challenges/${id}`);
    return {
      success: true,
      challenge: response.data.challenge
    };
  } catch (error) {
    console.error(`Error fetching challenge ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch challenge'
    };
  }
};

const submitSolution = async (challengeId, code, language) => {
  try {
    const response = await api.post(`/challenges/${challengeId}/submit`, {
      code,
      language
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting solution:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit solution'
    };
  }
};

// Resource APIs
const getResources = async () => {
  try {
    const response = await api.get('/resources');
    return response.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch resources' };
  }
};

const getResourceById = async (id) => {
  try {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch resource' };
  }
};

const createResource = async (resourceData) => {
  try {
    const response = await api.post('/resources', resourceData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to create resource' };
  }
};

// User profile APIs
const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/profile`);
    return {
      success: true,
      profile: response.data.profile
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch profile'
    };
  }
};

const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/${userId}/profile`, profileData);
    return {
      success: true,
      profile: response.data.profile
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile'
    };
  }
};

// Health check API
const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      status: response.data
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      success: false,
      error: 'Health check failed'
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

// Auth related functions
const verifyToken = async () => {
  try {
    const response = await api.post('/auth/verify');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { success: false, error: error.response?.data?.message || 'Token verification failed' };
  }
};

const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return { success: false, error: error.response?.data?.message || 'Token refresh failed' };
  }
};

// Challenge related functions
const submitChallenge = async (challengeId, solution) => {
  try {
    const response = await api.post(`/challenges/${challengeId}/submit`, { solution });
    return { success: true, result: response.data };
  } catch (error) {
    console.error('Challenge submission failed:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to submit challenge' };
  }
};

const getUserProgress = async () => {
  try {
    const response = await api.get('/user/progress');
    return { success: true, progress: response.data };
  } catch (error) {
    console.error('Failed to get user progress:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to get user progress' };
  }
};

const getLeaderboard = async () => {
  try {
    const response = await api.get('/leaderboard');
    return { success: true, leaderboard: response.data };
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to get leaderboard' };
  }
};

// Resource related functions
const getFavorites = async () => {
  try {
    const response = await api.get('/resources/favorites');
    return { success: true, favorites: response.data };
  } catch (error) {
    console.error('Failed to get favorites:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to get favorites' };
  }
};

const toggleFavorite = async (resourceId) => {
  try {
    const response = await api.post(`/resources/${resourceId}/favorite`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to toggle favorite status' };
  }
};

const uploadResource = async (resourceData) => {
  try {
    const formData = new FormData();
    for (const key in resourceData) {
      formData.append(key, resourceData[key]);
    }
    
    const response = await api.post('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return { success: true, resource: response.data };
  } catch (error) {
    console.error('Resource upload failed:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to upload resource' };
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
