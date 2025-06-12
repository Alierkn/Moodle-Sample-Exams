import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';

// Components
import AuthForms from './components/auth/AuthForms';
import ChallengePage from './components/Challenges/ChallengePage';
import DocumentsPage from './components/Documents/DocumentsPage';
import ProfilePage from './components/Profile/ProfilePage';

// Services
import { getCurrentUser, logout } from './services/supabaseService';



function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
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
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-blue-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold">Moodle Exam Simulator</Link>
              </div>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/challenges" className="hover:text-blue-200">Challenges</Link>
                  <Link to="/documents" className="hover:text-blue-200">Documents</Link>
                  <Link to="/profile" className="hover:text-blue-200">Profile</Link>
                  <div className="flex items-center">
                    <span className="mr-2">{user.username || user.email}</span>
                    <button 
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Link to="/login" className="hover:text-blue-200">Login / Register</Link>
                </div>
              )}
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold mb-6">Welcome to Moodle Exam Simulator</h1>
                <p className="text-xl mb-8">Practice programming challenges in a Moodle-like environment</p>
                
                {user ? (
                  <div className="flex justify-center space-x-6">
                    <Link 
                      to="/challenges" 
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg text-lg"
                    >
                      Start Practicing
                    </Link>
                    <Link 
                      to="/documents" 
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg text-lg"
                    >
                      View Documents
                    </Link>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg text-lg"
                  >
                    Login to Start
                  </Link>
                )}
              </div>
            } />
            
            <Route path="/login" element={
              user ? <Navigate to="/" /> : <AuthForms onAuthSuccess={handleAuthSuccess} />
            } />
            
            <Route path="/challenges" element={
              user ? <ChallengePage /> : <Navigate to="/login" />
            } />
            
            <Route path="/documents" element={
              user ? <DocumentsPage /> : <Navigate to="/login" />
            } />
            
            <Route path="/profile" element={
              user ? <ProfilePage /> : <Navigate to="/login" />
            } />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} Moodle Exam Simulator</p>
            <p className="text-sm text-gray-400 mt-2">A tool to help students practice for programming exams</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
