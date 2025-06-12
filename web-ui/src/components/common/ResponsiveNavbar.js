import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

/**
 * Responsive navigation bar component
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Function} props.onLogout - Logout handler function
 */
const ResponsiveNavbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    onLogout();
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">Moodle Exam Simulator</Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/challenges" className="hover:text-blue-200">Challenges</Link>
                <Link to="/documents" className="hover:text-blue-200">Documents</Link>
                <Link to="/profile" className="hover:text-blue-200">Profile</Link>
                <div className="flex items-center">
                  <span className="mr-2">{user.username || user.email}</span>
                  <button 
                    onClick={onLogout}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="hover:text-blue-200">Login / Register</Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="focus:outline-none"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 py-3 border-t border-blue-500">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Link 
                    to="/challenges" 
                    className="hover:text-blue-200 py-1"
                    onClick={closeMenu}
                  >
                    Challenges
                  </Link>
                  <Link 
                    to="/documents" 
                    className="hover:text-blue-200 py-1"
                    onClick={closeMenu}
                  >
                    Documents
                  </Link>
                  <Link 
                    to="/profile" 
                    className="hover:text-blue-200 py-1"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                  <div className="flex flex-col space-y-2 pt-2 border-t border-blue-500">
                    <span className="text-sm">{user.username || user.email}</span>
                    <button 
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm self-start"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="hover:text-blue-200 py-1"
                  onClick={closeMenu}
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ResponsiveNavbar;
