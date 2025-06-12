import apiService from './api';

// Token refresh timing (15 minutes before expiration)
const REFRESH_THRESHOLD_MS = 15 * 60 * 1000; 
let refreshTokenTimeout = null;

/**
 * Parse JWT token to get expiration time
 */
const parseToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Set up token refresh mechanism
 */
const setupTokenRefresh = (token) => {
  // Clear any existing timeout
  if (refreshTokenTimeout) {
    clearTimeout(refreshTokenTimeout);
  }

  const payload = parseToken(token);
  if (!payload || !payload.exp) {
    console.error('Invalid token format');
    return;
  }

  // Calculate when to refresh (token expiration time minus threshold)
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeUntilRefresh = expirationTime - currentTime - REFRESH_THRESHOLD_MS;

  // Only set up refresh if the token isn't already expired
  if (timeUntilRefresh <= 0) {
    console.warn('Token already expired or close to expiration');
    return;
  }

  // Set timeout to refresh token
  refreshTokenTimeout = setTimeout(async () => {
    try {
      const response = await apiService.refreshToken();
      if (response.data.success && response.data.token) {
        // Update user in localStorage with new token
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.token = response.data.token;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set up refresh for the new token
        setupTokenRefresh(response.data.token);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }, timeUntilRefresh);

  console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 60000)} minutes`);
};

/**
 * Initialize auth state from localStorage and set up token refresh
 */
const initializeAuth = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      if (userData.token) {
        setupTokenRefresh(userData.token);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
};

/**
 * Clean up auth state on logout
 */
const cleanupAuth = () => {
  if (refreshTokenTimeout) {
    clearTimeout(refreshTokenTimeout);
    refreshTokenTimeout = null;
  }
};

const authService = {
  initializeAuth,
  setupTokenRefresh,
  cleanupAuth
};

export default authService;
