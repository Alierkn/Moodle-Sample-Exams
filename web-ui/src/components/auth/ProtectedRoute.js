import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute component to handle authentication and authorization
 * @param {Object} props - Component props
 * @param {boolean} props.requireAdmin - Whether the route requires admin access
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // If auth is still loading, show loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Yükleniyor...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires admin access but user is not admin
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // User is authenticated (and is admin if required)
  return <Outlet />;
};

export default ProtectedRoute;
