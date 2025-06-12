import React, { useState, useEffect } from 'react';
import { Menu, X, Code2, User, FileText, Trophy, Sparkles, ChevronDown, LogOut } from 'lucide-react';

// Mock ThemeToggle component
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0'}`}>
        <div className="flex items-center justify-center w-full h-full">
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
};

/**
 * Modern Responsive Navigation Bar Component
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Function} props.onLogout - Logout handler function
 */
const ResponsiveNavbar = ({ user = { username: "John Doe", email: "john@example.com" }, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
    };
    
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    setUserMenuOpen(false);
    onLogout && onLogout();
  };

  const navigationLinks = [
    { to: '/challenges', label: 'Challenges', icon: Trophy },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl border-b border-gray-200/30 dark:border-gray-700/30' 
          : 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md shadow-lg'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo/Brand */}
            <div className="flex items-center group">
              <div className="relative">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                
                {/* Logo container */}
                <div className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Code2 className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={`text-xl font-bold transition-colors duration-300 ${
                      isScrolled 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                        : 'text-white'
                    }`}>
                      Moodle Simulator
                    </span>
                    <span className={`text-xs transition-colors duration-300 ${
                      isScrolled 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-blue-100'
                    }`}>
                      Exam Platform
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Theme Toggle */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>
              
              {user ? (
                <>
                  {/* Navigation Links */}
                  <div className="flex items-center space-x-2">
                    {navigationLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.to}
                          href={link.to}
                          className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                            isScrolled
                              ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              : 'text-white hover:text-blue-200 hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          <span>{link.label}</span>
                          
                          {/* Animated underline */}
                          <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform -translate-x-1/2 group-hover:w-full transition-all duration-300" />
                        </a>
                      );
                    })}
                  </div>
                  
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserMenuOpen(!userMenuOpen);
                      }}
                      className={`group flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        isScrolled
                          ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                        {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      
                      <div className="hidden lg:flex flex-col items-start">
                        <span className="text-sm font-medium">{user.username || user.email}</span>
                        <span className={`text-xs ${
                          isScrolled ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'
                        }`}>
                          Premium User
                        </span>
                      </div>
                      
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 animate-fade-in-up">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                              {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{user.username || user.email}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <a href="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                            <User className="w-4 h-4" />
                            <span>Profile Settings</span>
                          </a>
                          <a href="/achievements" className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                            <Trophy className="w-4 h-4" />
                            <span>Achievements</span>
                          </a>
                        </div>
                        
                        {/* Logout */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <a
                  href="/login"
                  className={`group relative px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    isScrolled
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  <span className="relative z-10">Login / Register</span>
                  <Sparkles className="absolute top-1 right-1 w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button 
                onClick={toggleMenu}
                className={`p-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isScrolled
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-white hover:bg-white/10'
                }`}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                <div className="relative w-6 h-6">
                  <Menu className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`} />
                  <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Navigation Menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
        isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />
        
        {/* Menu Panel */}
        <div className={`absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-500 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <button 
                onClick={closeMenu}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold backdrop-blur-sm">
                  {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user.username || user.email}</p>
                  <p className="text-blue-100 text-sm">Premium Member</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Menu Content */}
          <div className="p-6 space-y-4">
            {user ? (
              <>
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.to}
                      href={link.to}
                      className="flex items-center gap-4 p-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                      onClick={closeMenu}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </a>
                  );
                })}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 p-4 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 w-full group"
                  >
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <a
                href="/login"
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all duration-300 group"
                onClick={closeMenu}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-medium">Login / Register</span>
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default ResponsiveNavbar;