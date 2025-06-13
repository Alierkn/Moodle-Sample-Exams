import React, { useState, useEffect, createContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, Code2, Globe, Heart, Github, Twitter, Linkedin, LogIn, UserPlus, BookOpen, Database, Shield } from 'lucide-react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChallengePage from './components/challenges/ChallengePage';
import ResourcesPage from './components/resources/ResourcesPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Unauthorized from './components/auth/Unauthorized';
import AdminPanel from './components/admin/AdminPanel';
import Dashboard from './components/dashboard/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Context definitions
export const ToastContext = createContext();
export const ThemeContext = createContext();

// Toast utility hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const showSuccess = (message) => {
    const toast = { id: Date.now(), message, type: 'success' };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 3000);
  };
  
  const showError = (message) => {
    const toast = { id: Date.now(), message, type: 'error' };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 3000);
  };
  
  return { showSuccess, showError, toasts };
};

// Theme utility hook
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  return { theme, toggleTheme };
};

// Responsive navigation component
const ResponsiveNavbar = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Moodle Simulator
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          <Link to="/challenges" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Challenges
          </Link>
          <Link to="/resources" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Resources
          </Link>
          {user && user.profile?.role === 'admin' && (
            <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Welcome, {user.profile?.username || user.email || 'User'}
            </span>
            <button
              onClick={onLogout}
              className="px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1 text-sm px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 dark:border-blue-500 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// Toast notification component
const Toast = ({ message, type }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg text-white ${bgColor} shadow-lg animate-fade-in-up`}>
      {message}
    </div>
  );
};

// Footer component
const Footer = () => (
  <footer className="relative z-10 bg-gray-900/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-700/30 text-white">
    <div className="container mx-auto px-4 py-12">
      {/* Footer content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Brand section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Moodle Simulator
            </span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Empowering students with cutting-edge programming practice tools and exam preparation resources.
          </p>
        </div>
        
        {/* Quick links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="space-y-2">
            {['Practice', 'Challenges', 'Documentation', 'Resources'].map(link => (
              <li key={link}>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Social links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Connect With Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
        <p>© 2025 Moodle Simulator. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-2">
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

// Main landing page hero section
const Hero = () => (
  <div className="bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-10 pb-24">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
          New Features Available
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
          Master Programming with <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Interactive Practice</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Practice programming challenges in a simulated exam environment to prepare for your real coding exams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            to="/challenges"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Code2 className="w-5 h-5" />
            Start Practicing
          </Link>
          <Link
            to="/resources"
            className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            View Resources
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// App entry point
function App() {
  const { toasts, showSuccess, showError } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      showSuccess("Logout successful");
    } catch (error) {
      showError("Logout failed: " + error.message);
    }
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
          <ResponsiveNavbar user={user} onLogout={handleLogout} />
          
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Hero />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/challenges" element={
                <ProtectedRoute>
                  <ChallengePage />
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              } />
              
              {/* Admin routes - require admin role */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Render toast notifications */}
          <div className="toast-container">
            {toasts.map(toast => (
              <Toast key={toast.id} {...toast} />
            ))}
          </div>
        </div>
      </ThemeContext.Provider>
    </ToastContext.Provider>
  );
}

export default function AppWithProviders() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
