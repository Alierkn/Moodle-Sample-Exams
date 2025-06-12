import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Loader2, Home, Lock, Trophy, FileText, User, AlertCircle } from 'lucide-react';

// Mock route components for demonstration
const HomePage = ({ user }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
    <div className="text-center p-8">
      <Home className="w-20 h-20 mx-auto mb-6 text-blue-600" />
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome Home</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300">
        {user ? `Hello, ${user.name}!` : 'Please login to continue'}
      </p>
    </div>
  </div>
);

const AuthForms = ({ onAuthSuccess }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-950 flex items-center justify-center">
    <div className="text-center p-8">
      <Lock className="w-20 h-20 mx-auto mb-6 text-purple-600" />
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Authentication</h1>
      <button 
        onClick={() => onAuthSuccess({ name: 'Demo User', email: 'demo@example.com' })}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Demo Login
      </button>
    </div>
  </div>
);

const ChallengePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-emerald-950 flex items-center justify-center">
    <div className="text-center p-8">
      <Trophy className="w-20 h-20 mx-auto mb-6 text-green-600" />
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Challenges</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300">Test your skills here!</p>
    </div>
  </div>
);

const DocumentsPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-orange-950 flex items-center justify-center">
    <div className="text-center p-8">
      <FileText className="w-20 h-20 mx-auto mb-6 text-yellow-600" />
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Documents</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300">Access your documents here</p>
    </div>
  </div>
);

const ProfilePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-pink-950 flex items-center justify-center">
    <div className="text-center p-8">
      <User className="w-20 h-20 mx-auto mb-6 text-red-600" />
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Profile</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300">Manage your profile settings</p>
    </div>
  </div>
);

// Enhanced Page Transition Component
const PageTransition = ({ 
  children, 
  variant = 'slide',
  direction = 'left',
  duration = 600,
  isEntering = true
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isEntering) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }
  }, [isEntering]);

  const getTransitionClasses = () => {
    const baseClasses = `transition-all ease-out`;
    const durationClass = `duration-[${duration}ms]`;
    
    switch (variant) {
      case 'slide':
        if (!isVisible) {
          switch (direction) {
            case 'left': return `${baseClasses} ${durationClass} opacity-0 transform translate-x-8`;
            case 'right': return `${baseClasses} ${durationClass} opacity-0 transform -translate-x-8`;
            case 'up': return `${baseClasses} ${durationClass} opacity-0 transform translate-y-8`;
            case 'down': return `${baseClasses} ${durationClass} opacity-0 transform -translate-y-8`;
            default: return `${baseClasses} ${durationClass} opacity-0 transform translate-x-8`;
          }
        }
        return `${baseClasses} ${durationClass} opacity-100 transform translate-x-0 translate-y-0`;
      
      case 'fade':
        return `${baseClasses} ${durationClass} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
      
      case 'scale':
        return `${baseClasses} ${durationClass} ${
          isVisible 
            ? 'opacity-100 transform scale-100' 
            : 'opacity-0 transform scale-95'
        }`;
      
      default:
        return `${baseClasses} ${durationClass} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
    }
  };

  return (
    <div className={`w-full h-full ${getTransitionClasses()}`}>
      {children}
    </div>
  );
};

// Enhanced Loading Component
const RouteLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center p-8">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse" />
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400 animate-pulse">{message}</p>
    </div>
  </div>
);

// Error Boundary Component
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950">
          <div className="text-center p-8 max-w-md">
            <AlertCircle className="w-20 h-20 mx-auto mb-6 text-red-600" />
            <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-red-600 dark:text-red-300 mb-6">
              We encountered an error while loading this page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ user, children, fallback }) => {
  if (!user) {
    return fallback;
  }
  return children;
};

// Route Configuration
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    icon: Home,
    public: true,
    transition: { variant: 'fade' }
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthForms,
    icon: Lock,
    public: true,
    hideWhenAuthenticated: true,
    transition: { variant: 'slide', direction: 'right' }
  },
  {
    path: '/challenges',
    name: 'Challenges',
    component: ChallengePage,
    icon: Trophy,
    protected: true,
    transition: { variant: 'slide', direction: 'up' }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: DocumentsPage,
    icon: FileText,
    protected: true,
    transition: { variant: 'scale' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    icon: User,
    protected: true,
    transition: { variant: 'slide', direction: 'down' }
  }
];

/**
 * Modern Animated Routes Component with Enhanced Features
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Function} props.handleAuthSuccess - Auth success handler
 * @param {string} props.currentPath - Current route path
 * @param {Function} props.onRouteChange - Route change handler
 */
const AnimatedRoutes = ({ 
  user, 
  handleAuthSuccess,
  currentPath = '/',
  onRouteChange
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(currentPath);
  const [transitionDirection, setTransitionDirection] = useState('left');

  // Handle route navigation
  const navigateTo = useCallback((newPath) => {
    if (newPath === currentRoute) return;

    setIsTransitioning(true);
    
    // Determine transition direction based on route order
    const currentIndex = routes.findIndex(r => r.path === currentRoute);
    const newIndex = routes.findIndex(r => r.path === newPath);
    setTransitionDirection(newIndex > currentIndex ? 'left' : 'right');

    setTimeout(() => {
      setCurrentRoute(newPath);
      setIsTransitioning(false);
      onRouteChange?.(newPath);
    }, 300);
  }, [currentRoute, onRouteChange]);

  // Get current route config
  const getCurrentRoute = () => {
    return routes.find(route => route.path === currentRoute) || routes[0];
  };

  const currentRouteConfig = getCurrentRoute();
  const CurrentComponent = currentRouteConfig.component;

  // Handle protected routes
  const renderRoute = () => {
    // Redirect authenticated users away from login
    if (currentRoute === '/login' && user && currentRouteConfig.hideWhenAuthenticated) {
      navigateTo('/');
      return null;
    }

    // Handle protected routes
    if (currentRouteConfig.protected && !user) {
      navigateTo('/login');
      return null;
    }

    // Render the component with proper props
    const componentProps = {
      user,
      onAuthSuccess: handleAuthSuccess,
      navigateTo
    };

    return (
      <RouteErrorBoundary>
        <Suspense fallback={<RouteLoader message={`Loading ${currentRouteConfig.name}...`} />}>
          <PageTransition
            variant={currentRouteConfig.transition?.variant || 'slide'}
            direction={currentRouteConfig.transition?.direction || transitionDirection}
            duration={600}
            isEntering={!isTransitioning}
          >
            <CurrentComponent {...componentProps} />
          </PageTransition>
        </Suspense>
      </RouteErrorBoundary>
    );
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Navigation breadcrumb */}
      <div className="fixed top-20 left-4 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <currentRouteConfig.icon size={16} />
          <span>{currentRouteConfig.name}</span>
        </div>
      </div>

      {/* Quick navigation */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            {routes
              .filter(route => 
                route.public || 
                (route.protected && user) ||
                (!user && route.path === '/login')
              )
              .filter(route => !(route.hideWhenAuthenticated && user))
              .map(route => {
                const Icon = route.icon;
                const isActive = route.path === currentRoute;
                
                return (
                  <button
                    key={route.path}
                    onClick={() => navigateTo(route.path)}
                    className={`p-3 rounded-xl transition-all duration-300 relative group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    title={route.name}
                  >
                    <Icon size={20} />
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {route.name}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">Transitioning...</span>
            </div>
          </div>
        </div>
      )}

      {/* Main route content */}
      <div className="w-full h-full">
        {renderRoute()}
      </div>
    </div>
  );
};

// Demo wrapper component
export const AnimatedRoutesDemo = () => {
  const [user, setUser] = useState(null);
  const [currentPath, setCurrentPath] = useState('/');

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setCurrentPath('/');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPath('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Demo controls */}
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Demo Controls</div>
        <div className="flex gap-2">
          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => handleAuthSuccess({ name: 'Demo User' })}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Quick Login
            </button>
          )}
        </div>
      </div>

      <AnimatedRoutes
        user={user}
        handleAuthSuccess={handleAuthSuccess}
        currentPath={currentPath}
        onRouteChange={setCurrentPath}
      />
    </div>
  );
};

export default AnimatedRoutes;