import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import './styles/theme.css';

// Components
import ResponsiveNavbar from './components/common/ResponsiveNavbar';
import AnimatedRoutes from './components/common/AnimatedRoutes';

// Services
import { getCurrentUser, logout } from './services/supabaseService';

// Context
import { ToastProvider, useToast } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Verify with backend
        const result = await getCurrentUser();
        if (result.success) {
          setUser(result.user);
        } else {
          // Clear invalid session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    showSuccess(`Welcome, ${userData.username || userData.email}!`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      showSuccess('You have been logged out successfully');
    } catch (error) {
      showError('Logout failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-theme">
        {/* Navigation */}
        <ResponsiveNavbar user={user} onLogout={handleLogout} />
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <AnimatedRoutes user={user} handleAuthSuccess={handleAuthSuccess} />
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-800 dark:bg-gray-950 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} Moodle Exam Simulator</p>
            <p className="text-sm text-gray-400 mt-2">A tool to help students practice for programming exams</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// Wrapper component that provides context providers
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
