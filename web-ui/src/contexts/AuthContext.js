import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabase';

// Create the auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const { success, user: userData, error: authError } = await authService.getCurrentUser();
        
        if (success && userData) {
          setUser(userData);
        } else {
          setUser(null);
          if (authError) setError(authError);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const { success, user: userData, error: loginError } = await authService.login(email, password);
      
      if (success && userData) {
        setUser(userData);
        return { success: true, user: userData };
      } else {
        setError(loginError || 'Login failed');
        return { success: false, error: loginError || 'Login failed' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, username) => {
    setLoading(true);
    setError(null);
    
    try {
      const { success, user: userData, error: registerError } = await authService.register(email, password, username);
      
      if (success && userData) {
        setUser(userData);
        return { success: true, user: userData };
      } else {
        setError(registerError || 'Registration failed');
        return { success: false, error: registerError || 'Registration failed' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { success, error: logoutError } = await authService.logout();
      
      if (success) {
        setUser(null);
        return { success: true };
      } else {
        setError(logoutError || 'Logout failed');
        return { success: false, error: logoutError || 'Logout failed' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.profile?.role === 'admin';
  };

  // The context value that will be supplied to any descendants of this provider
  const contextValue = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    setUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
