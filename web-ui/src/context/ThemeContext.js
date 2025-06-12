import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create theme context
const ThemeContext = createContext();

/**
 * Enhanced Theme Provider Component
 * Manages multiple themes, animations, and advanced preferences throughout the application
 */
export const ThemeProvider = ({ children }) => {
  // Available themes with their configurations
  const themes = {
    light: {
      name: 'Light',
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      accent: '#10b981'
    },
    dark: {
      name: 'Dark',
      primary: '#60a5fa',
      secondary: '#818cf8',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      accent: '#34d399'
    },
    ocean: {
      name: 'Ocean',
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      background: '#0c4a6e',
      surface: '#075985',
      text: '#e0f2fe',
      accent: '#22d3ee'
    },
    forest: {
      name: 'Forest',
      primary: '#059669',
      secondary: '#10b981',
      background: '#064e3b',
      surface: '#065f46',
      text: '#ecfdf5',
      accent: '#34d399'
    },
    sunset: {
      name: 'Sunset',
      primary: '#f59e0b',
      secondary: '#f97316',
      background: '#451a03',
      surface: '#78350f',
      text: '#fef3c7',
      accent: '#fbbf24'
    },
    purple: {
      name: 'Purple Dream',
      primary: '#8b5cf6',
      secondary: '#a855f7',
      background: '#312e81',
      surface: '#3730a3',
      text: '#ede9fe',
      accent: '#c084fc'
    },
    cyber: {
      name: 'Cyberpunk',
      primary: '#00ffff',
      secondary: '#ff00ff',
      background: '#000011',
      surface: '#1a0033',
      text: '#00ff88',
      accent: '#ffff00'
    }
  };

  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const getInitialSettings = () => {
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch {
        return {};
      }
    }
    return {};
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [themeSettings, setThemeSettings] = useState(() => ({
    animations: true,
    autoTheme: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    ...getInitialSettings()
  }));

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Apply theme with smooth transition
  const applyTheme = useCallback((themeName, settings = themeSettings) => {
    const root = window.document.documentElement;
    const themeConfig = themes[themeName];
    
    if (!themeConfig) return;

    // Add transition class for smooth theme change
    if (settings.animations && !settings.reducedMotion) {
      setIsTransitioning(true);
      root.classList.add('theme-transitioning');
      
      setTimeout(() => {
        setIsTransitioning(false);
        root.classList.remove('theme-transitioning');
      }, 300);
    }

    // Remove all theme classes
    Object.keys(themes).forEach(t => root.classList.remove(`theme-${t}`));
    
    // Add current theme class
    root.classList.add(`theme-${themeName}`);
    
    // Apply CSS custom properties
    Object.entries(themeConfig).forEach(([key, value]) => {
      if (key !== 'name') {
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    // Apply accessibility settings
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${settings.fontSize}`);

    // Save to localStorage
    localStorage.setItem('theme', themeName);
    localStorage.setItem('themeSettings', JSON.stringify(settings));
  }, [themes, themeSettings]);

  // Update theme when theme or settings change
  useEffect(() => {
    applyTheme(theme, themeSettings);
  }, [theme, themeSettings, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!themeSettings.autoTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeSettings.autoTheme]);

  // Add CSS for smooth transitions
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .theme-transitioning,
      .theme-transitioning * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
      }
      
      .high-contrast {
        filter: contrast(1.5);
      }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .font-small { font-size: 14px; }
      .font-medium { font-size: 16px; }
      .font-large { font-size: 18px; }
      
      :root {
        --transition-theme: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'light';
      return 'light'; // Default fallback
    });
  }, []);

  // Set a specific theme
  const setThemeMode = useCallback((mode) => {
    if (themes[mode]) {
      setTheme(mode);
    }
  }, [themes]);

  // Cycle through available themes
  const cycleTheme = useCallback(() => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  }, [theme, themes]);

  // Update theme settings
  const updateSettings = useCallback((newSettings) => {
    setThemeSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  // Get current theme configuration
  const getCurrentTheme = useCallback(() => {
    return themes[theme];
  }, [theme, themes]);

  // Check if theme is dark
  const isDark = useCallback(() => {
    return ['dark', 'ocean', 'forest', 'sunset', 'purple', 'cyber'].includes(theme);
  }, [theme]);

  // Auto theme based on time of day
  const setAutoThemeByTime = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Generate random theme
  const setRandomTheme = useCallback(() => {
    const themeKeys = Object.keys(themes);
    const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    setTheme(randomTheme);
  }, [themes]);

  const contextValue = {
    // Theme state
    theme,
    themes,
    themeSettings,
    isTransitioning,
    
    // Theme methods
    setThemeMode,
    toggleTheme,
    cycleTheme,
    setRandomTheme,
    setAutoThemeByTime,
    
    // Settings methods
    updateSettings,
    
    // Helper methods
    getCurrentTheme,
    isDark,
    
    // Theme list for UI components
    availableThemes: Object.keys(themes).map(key => ({
      key,
      name: themes[key].name,
      config: themes[key]
    }))
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 * Provides theme state and methods with error handling
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme Toggle Component
 * Ready-to-use component for theme switching
 */
export const ThemeToggle = ({ className = '', showLabel = true }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center px-4 py-2 rounded-lg
        bg-opacity-20 backdrop-blur-sm border border-opacity-30
        transition-all duration-300 hover:scale-105
        ${isDark() 
          ? 'bg-yellow-500 border-yellow-500 text-yellow-300' 
          : 'bg-blue-500 border-blue-500 text-blue-600'
        }
        ${className}
      `}
      aria-label={`Switch to ${isDark() ? 'light' : 'dark'} theme`}
    >
      <span className="text-xl mr-2">
        {isDark() ? '☀️' : '🌙'}
      </span>
      {showLabel && (
        <span className="font-medium">
          {isDark() ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

/**
 * Theme Selector Component
 * Dropdown/grid selector for all available themes
 */
export const ThemeSelector = ({ className = '', variant = 'dropdown' }) => {
  const { theme, availableThemes, setThemeMode } = useTheme();
  
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {availableThemes.map(({ key, name, config }) => (
          <button
            key={key}
            onClick={() => setThemeMode(key)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200
              ${theme === key 
                ? 'border-current ring-2 ring-offset-2 ring-current' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            style={{
              backgroundColor: config.surface,
              color: config.text,
              borderColor: config.primary
            }}
          >
            <div className="text-sm font-medium">{name}</div>
            <div className="flex space-x-1 mt-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: config.primary }}
              />
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: config.secondary }}
              />
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: config.accent }}
              />
            </div>
          </button>
        ))}
      </div>
    );
  }
  
  return (
    <select
      value={theme}
      onChange={(e) => setThemeMode(e.target.value)}
      className={`
        px-3 py-2 rounded-lg border border-gray-300 
        bg-white dark:bg-gray-800 dark:border-gray-600
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${className}
      `}
    >
      {availableThemes.map(({ key, name }) => (
        <option key={key} value={key}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default ThemeProvider;