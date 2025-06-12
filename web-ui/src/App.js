import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Code2, Globe, Heart, Github, Twitter, Linkedin } from 'lucide-react';

// Mock components for demonstration
const ResponsiveNavbar = ({ user, onLogout }) => (
  <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-50 transition-all duration-300">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Moodle Simulator
        </span>
      </div>
      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user.username || user.email}</span>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-600 dark:text-gray-300">Not logged in</div>
      )}
    </div>
  </nav>
);

const AnimatedRoutes = ({ user, handleAuthSuccess }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-white animate-pulse" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Welcome to Moodle Simulator
      </h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
        Your routes and content would be rendered here based on the current navigation state.
      </p>
      {!user && (
        <button 
          onClick={() => handleAuthSuccess({ username: 'demo', email: 'demo@example.com' })}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          Demo Login
        </button>
      )}
    </div>
  </div>
);

// Mock contexts
const ToastContext = React.createContext();
const ThemeContext = React.createContext();

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

const ToastProvider = ({ children }) => {
  const toast = useToast();
  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toast.toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm transform transition-all duration-300 animate-slide-in ${
              t.type === 'success' 
                ? 'bg-green-500/90 text-white' 
                : 'bg-red-500/90 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Mock services
const getCurrentUser = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: false, user: null });
    }, 1000);
  });
};

const logout = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { showSuccess, showError } = useToast();
  
  useEffect(() => {
    // Mouse tracking for dynamic effects
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  useEffect(() => {
    // Enhanced auth check with better UX
    const checkAuth = async () => {
      try {
        // Simulate minimum loading time for better UX
        const [authResult] = await Promise.all([
          getCurrentUser(),
          new Promise(resolve => setTimeout(resolve, 800))
        ]);
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        if (authResult.success) {
          setUser(authResult.user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        showError('Failed to verify authentication');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [showError]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    showSuccess(`Welcome back, ${userData.username || userData.email}! 🎉`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      showSuccess('Successfully logged out. See you soon! 👋');
    } catch (error) {
      showError('Logout failed: ' + error.message);
    }
  };

  // Enhanced loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-bounce" />
        </div>
        
        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-ping" />
          </div>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Loading Your Experience
          </h2>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">
            Preparing everything for you...
          </p>
          
          {/* Loading progress bar */}
          <div className="mt-6 w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-700 relative overflow-hidden">
      {/* Dynamic background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl transition-all duration-700"
          style={{
            left: mousePosition.x / 15,
            top: mousePosition.y / 15,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-cyan-600/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-rose-600/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Navigation */}
      <ResponsiveNavbar user={user} onLogout={handleLogout} />
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          <AnimatedRoutes user={user} handleAuthSuccess={handleAuthSuccess} />
        </div>
      </main>
      
      {/* Enhanced Footer */}
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
                {['Practice', 'Challenges', 'Documentation', 'Progress'].map(link => (
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
            
            {/* Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Community</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Students', value: '10K+' },
                  { label: 'Challenges', value: '500+' },
                  { label: 'Success Rate', value: '95%' },
                  { label: 'Universities', value: '50+' }
                ].map(stat => (
                  <div key={stat.label} className="text-center p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
                    <div className="text-lg font-bold text-blue-400">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="pt-8 border-t border-gray-700/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-400">
                  &copy; {new Date().getFullYear()} Moodle Exam Simulator
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Made with</span>
                  <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>for students</span>
                </div>
              </div>
              
              {/* Social links */}
              <div className="flex items-center gap-4">
                {[
                  { icon: Github, href: '#', label: 'GitHub' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Globe, href: '#', label: 'Website' }
                ].map(social => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Custom styles */}
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0%); opacity: 1; }
        }
        
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
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