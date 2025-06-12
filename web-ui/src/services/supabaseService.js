/**
 * Supabase service for the Moodle Exam Simulator
 * This service provides functions to interact with the Supabase backend
 */

// Use environment variable if available, otherwise fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Register a new user
 * @param {string} username - Username
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {Promise<Object>} - Response
 */
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
};

/**
 * Login a user
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {Promise<Object>} - Response with user and token
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    
    if (data.success) {
      // Store token in local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
};

/**
 * Logout the current user
 * @returns {Promise<Object>} - Response
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Logout failed' };
  }
};

/**
 * Get the current user
 * @returns {Promise<Object>} - Response with user
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No token found' };
    }
    
    const response = await fetch(`${API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Get user error:', error);
    return { success: false, message: 'Failed to get user' };
  }
};

/**
 * Get all challenges
 * @returns {Promise<Object>} - Response with challenges
 */
export const getChallenges = async () => {
  try {
    const response = await fetch(`${API_URL}/challenges`);
    return await response.json();
  } catch (error) {
    console.error('Get challenges error:', error);
    return { success: false, message: 'Failed to get challenges' };
  }
};

/**
 * Get a challenge by ID
 * @param {string} challengeId - Challenge ID
 * @returns {Promise<Object>} - Response with challenge
 */
export const getChallenge = async (challengeId) => {
  try {
    const response = await fetch(`${API_URL}/challenges/${challengeId}`);
    return await response.json();
  } catch (error) {
    console.error('Get challenge error:', error);
    return { success: false, message: 'Failed to get challenge' };
  }
};

/**
 * Create a new challenge
 * @param {Object} challengeData - Challenge data
 * @returns {Promise<Object>} - Response with created challenge
 */
export const createChallenge = async (challengeData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No token found' };
    }
    
    const response = await fetch(`${API_URL}/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(challengeData),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Create challenge error:', error);
    return { success: false, message: 'Failed to create challenge' };
  }
};

/**
 * Run code
 * @param {Object} codeData - Code data
 * @returns {Promise<Object>} - Response with execution result
 */
export const runCode = async (codeData) => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Add user ID if available
    if (user && user.id) {
      codeData.user_id = user.id;
    }
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/run-code`, {
      method: 'POST',
      headers,
      body: JSON.stringify(codeData),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Run code error:', error);
    return { 
      success: false, 
      error: 'Failed to run code',
      output: '',
      executionTime: 0,
      testsPassed: 0,
      totalTests: 0
    };
  }
};

/**
 * Get user challenges
 * @returns {Promise<Object>} - Response with user challenges
 */
export const getUserChallenges = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No token found' };
    }
    
    const response = await fetch(`${API_URL}/user-challenges`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Get user challenges error:', error);
    return { success: false, message: 'Failed to get user challenges' };
  }
};

/**
 * Get user profile with detailed information
 * @returns {Promise<Object>} - Response with user profile
 */
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No token found' };
    }
    
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, message: 'Failed to get user profile' };
  }
};

/**
 * Get all resources
 * @returns {Promise<Object>} - Response with resources
 */
export const getResources = async () => {
  try {
    const response = await fetch(`${API_URL}/resources`);
    return await response.json();
  } catch (error) {
    console.error('Get resources error:', error);
    return { success: false, message: 'Failed to get resources' };
  }
};

/**
 * Upload a document
 * @param {File} file - File to upload
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Object>} - Response with uploaded document
 */
export const uploadDocument = async (file, metadata = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No token found' };
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    const response = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    return await response.json();
  } catch (error) {
    console.error('Upload document error:', error);
    return { success: false, message: 'Failed to upload document' };
  }
};

/**
 * Get all documents
 * @returns {Promise<Object>} - Response with documents
 */
export const getDocuments = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No token found' };
    }
    
    const response = await fetch(`${API_URL}/documents`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Get documents error:', error);
    return { success: false, message: 'Failed to get documents' };
  }
};
