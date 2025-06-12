import React, { useState, useEffect } from 'react';
import { Sun, Moon, Palette, Monitor } from 'lucide-react';

// Mock theme context for demonstration
const useTheme = () => {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const setThemeMode = (mode) => {
    setTheme(mode);
  };
  
  return { theme, toggleTheme, setThemeMode };
};

/**
 * Modern Theme Toggle Component with Multiple Variants
 * @param {Object} props - Component props
 * @param {string} props.variant - Toggle variant (simple, switch, dropdown, floating)
 * @param {string} props.size - Size variant (sm, md, lg)
 * @param {boolean} props.showLabel - Whether to show theme labels
 * @param {string} props.position - Position for floating variant
 */
const ThemeToggle = ({ 
  variant = 'switch', 
  size = 'md',
  showLabel = false,
  position = 'bottom-right'
}) => {
  const { theme, toggleTheme, setThemeMode } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Animation trigger
  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Size variants
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-6 p-0.5';
      case 'lg':
        return 'w-16 h-9 p-1';
      case 'md':
      default:
        return 'w-12 h-7 p-0.5';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      case 'md':
      default: return 18;
    }
  };

  // Simple icon toggle variant
  if (variant === 'simple') {
    return (
      <button
        onClick={handleToggle}
        className="group relative p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <div className="relative">
          {/* Background glow effect */}
          <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${
            theme === 'dark' 
              ? 'bg-yellow-400/20 shadow-yellow-400/25' 
              : 'bg-blue-600/20 shadow-blue-600/25'
          } ${isAnimating ? 'shadow-lg scale-110' : 'shadow-sm scale-100'}`} />
          
          {/* Icons with rotation animation */}
          <div className="relative">
            <Sun 
              size={getIconSize()} 
              className={`absolute transition-all duration-500 text-yellow-500 ${
                theme === 'dark' 
                  ? 'opacity-100 rotate-0 scale-100' 
                  : 'opacity-0 -rotate-90 scale-75'
              }`} 
            />
            <Moon 
              size={getIconSize()} 
              className={`transition-all duration-500 text-blue-600 dark:text-blue-400 ${
                theme === 'light' 
                  ? 'opacity-100 rotate-0 scale-100' 
                  : 'opacity-0 rotate-90 scale-75'
              }`} 
            />
          </div>
        </div>
        
        {/* Label */}
        {showLabel && (
          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </button>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    const themes = [
      { id: 'light', name: 'Light', icon: Sun, color: 'text-yellow-500' },
      { id: 'dark', name: 'Dark', icon: Moon, color: 'text-blue-500' },
      { id: 'auto', name: 'Auto', icon: Monitor, color: 'text-gray-500' }
    ];

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="group flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Palette size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
        </button>

        {showDropdown && (
          <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 min-w-32 z-50 animate-fade-in-up">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <button
                  key={themeOption.id}
                  onClick={() => {
                    setThemeMode(themeOption.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === themeOption.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon size={16} className={themeOption.color} />
                  {themeOption.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Floating variant
  if (variant === 'floating') {
    const getPositionClasses = () => {
      switch (position) {
        case 'top-left': return 'top-4 left-4';
        case 'top-right': return 'top-4 right-4';
        case 'bottom-left': return 'bottom-4 left-4';
        case 'bottom-right': return 'bottom-4 right-4';
        default: return 'bottom-4 right-4';
      }
    };

    return (
      <button
        onClick={handleToggle}
        className={`fixed ${getPositionClasses()} z-50 p-4 bg-white dark:bg-gray-800 shadow-2xl rounded-full border border-gray-200 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all duration-300 group`}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Animated background */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          theme === 'dark' ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20' : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20'
        } opacity-0 group-hover:opacity-100`} />
        
        {/* Icon container */}
        <div className="relative">
          <Sun 
            size={24} 
            className={`absolute transition-all duration-500 text-yellow-500 ${
              theme === 'dark' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-180 scale-0'
            }`} 
          />
          <Moon 
            size={24} 
            className={`transition-all duration-500 text-blue-600 dark:text-blue-400 ${
              theme === 'light' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 rotate-180 scale-0'
            }`} 
          />
        </div>
      </button>
    );
  }

  // Default switch variant with enhanced design
  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
      
      <button
        onClick={handleToggle}
        className={`
          relative ${getSizeClasses()} 
          bg-gray-300 dark:bg-gray-600 rounded-full 
          transition-all duration-500 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-blue-500/30
          hover:shadow-lg hover:scale-105 active:scale-95
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-500/25' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-yellow-500/25'
          }
        `}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        role="switch"
        aria-checked={theme === 'dark'}
      >
        {/* Track background with gradient */}
        <div className={`
          absolute inset-0 rounded-full transition-all duration-500
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-slate-700 to-slate-800' 
            : 'bg-gradient-to-r from-sky-200 to-sky-300'
          }
        `} />
        
        {/* Animated thumb */}
        <div
          className={`
            relative flex items-center justify-center
            ${size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'}
            bg-white rounded-full shadow-lg
            transition-all duration-500 ease-in-out transform
            ${theme === 'dark' 
              ? size === 'sm' ? 'translate-x-4' : size === 'lg' ? 'translate-x-7' : 'translate-x-5'
              : 'translate-x-0'
            }
            ${isAnimating ? 'scale-110' : 'scale-100'}
          `}
        >
          {/* Icon inside thumb */}
          <div className="relative">
            <Sun 
              size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} 
              className={`absolute transition-all duration-300 text-yellow-600 ${
                theme === 'light' 
                  ? 'opacity-100 rotate-0' 
                  : 'opacity-0 -rotate-90'
              }`} 
            />
            <Moon 
              size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} 
              className={`transition-all duration-300 text-slate-700 ${
                theme === 'dark' 
                  ? 'opacity-100 rotate-0' 
                  : 'opacity-0 rotate-90'
              }`} 
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className={`
          absolute inset-0 rounded-full
          transition-all duration-500
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' 
            : 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20'
          }
          ${isAnimating ? 'animate-pulse' : ''}
        `} />
        
        {/* Stars for dark mode */}
        {theme === 'dark' && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-white rounded-full animate-pulse`}
                style={{
                  top: `${20 + i * 20}%`,
                  left: `${10 + i * 15}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Sun rays for light mode */}
        {theme === 'light' && (
          <div className="absolute inset-0 rounded-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-2 bg-yellow-300 rounded-full opacity-60"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-150%)`,
                  animation: `pulse 2s infinite ${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}
      </button>
    </div>
  );
};

// Demo component showing all variants
export const ThemeToggleShowcase = () => {
  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Theme Toggle Components
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Multiple variants of modern theme toggle components
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Simple variant */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Simple Toggle</h3>
            <div className="flex justify-center">
              <ThemeToggle variant="simple" showLabel />
            </div>
          </div>
          
          {/* Switch variant */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Switch Toggle</h3>
            <div className="flex justify-center space-x-4">
              <ThemeToggle variant="switch" size="sm" />
              <ThemeToggle variant="switch" size="md" />
              <ThemeToggle variant="switch" size="lg" />
            </div>
          </div>
          
          {/* Dropdown variant */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Dropdown Toggle</h3>
            <div className="flex justify-center">
              <ThemeToggle variant="dropdown" />
            </div>
          </div>
          
          {/* Labeled switch */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Labeled Switch</h3>
            <div className="flex justify-center">
              <ThemeToggle variant="switch" showLabel />
            </div>
          </div>
        </div>
        
        {/* Floating variant - positioned absolutely */}
        <ThemeToggle variant="floating" position="bottom-right" />
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ThemeToggle;