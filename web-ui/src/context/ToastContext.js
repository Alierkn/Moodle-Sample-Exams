import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader, Sparkles } from 'lucide-react';

// Create context
const ToastContext = createContext();

/**
 * Enhanced Toast Component with Modern Design
 */
const Toast = ({ id, type, message, title, duration, onClose, persistent, actions, progress, icon }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const timeoutRef = useRef();
  const intervalRef = useRef();

  const typeConfig = {
    success: {
      bgClass: 'bg-gradient-to-r from-emerald-500/90 to-green-500/90',
      borderClass: 'border-emerald-400/50',
      textClass: 'text-white',
      icon: <CheckCircle size={20} />,
      sound: 'success'
    },
    error: {
      bgClass: 'bg-gradient-to-r from-red-500/90 to-rose-500/90',
      borderClass: 'border-red-400/50',
      textClass: 'text-white',
      icon: <AlertCircle size={20} />,
      sound: 'error'
    },
    warning: {
      bgClass: 'bg-gradient-to-r from-amber-500/90 to-orange-500/90',
      borderClass: 'border-amber-400/50',
      textClass: 'text-white',
      icon: <AlertTriangle size={20} />,
      sound: 'warning'
    },
    info: {
      bgClass: 'bg-gradient-to-r from-blue-500/90 to-indigo-500/90',
      borderClass: 'border-blue-400/50',
      textClass: 'text-white',
      icon: <Info size={20} />,
      sound: 'info'
    },
    loading: {
      bgClass: 'bg-gradient-to-r from-gray-600/90 to-slate-600/90',
      borderClass: 'border-gray-400/50',
      textClass: 'text-white',
      icon: <Loader size={20} className="animate-spin" />,
      sound: null
    },
    custom: {
      bgClass: 'bg-gradient-to-r from-purple-500/90 to-pink-500/90',
      borderClass: 'border-purple-400/50',
      textClass: 'text-white',
      icon: <Sparkles size={20} />,
      sound: 'custom'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  useEffect(() => {
    // Show animation
    setIsVisible(true);

    if (!persistent && duration > 0) {
      // Start countdown
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 100) {
            handleClose();
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      // Auto close
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, persistent]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const pauseTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resumeTimer = () => {
    if (!persistent && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 100) {
            handleClose();
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, timeRemaining);
    }
  };

  const progressPercentage = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0;

  return (
    <div
      className={`
        relative mb-3 p-4 rounded-2xl backdrop-blur-md border shadow-2xl
        transform transition-all duration-300 ease-out cursor-pointer
        ${config.bgClass} ${config.borderClass} ${config.textClass}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'translate-x-full opacity-0 scale-95' : ''}
        hover:scale-105 hover:shadow-3xl
      `}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onClick={handleClose}
    >
      {/* Progress bar */}
      {!persistent && duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl overflow-hidden w-full">
          <div 
            className="h-full bg-white/70 transition-all duration-100 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {icon || config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold text-sm mb-1 truncate">
              {title}
            </div>
          )}
          <div className="text-sm opacity-90 leading-relaxed">
            {message}
          </div>

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    if (action.closeOnClick !== false) {
                      handleClose();
                    }
                  }}
                  className="px-3 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

/**
 * Enhanced Toast Provider Component
 * Manages toast notifications with advanced features throughout the application
 */
export const ToastProvider = ({ children, maxToasts = 5, position = 'top-right', globalDuration = 5000 }) => {
  const [toasts, setToasts] = useState([]);
  const toastCounter = useRef(0);

  // Position configurations
  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  // Add a new toast with enhanced options
  const addToast = useCallback((options) => {
    const {
      message,
      type = 'info',
      title,
      duration = globalDuration,
      persistent = false,
      actions = [],
      icon,
      onClose,
      priority = 'normal'
    } = typeof options === 'string' ? { message: options } : options;

    const id = `toast-${++toastCounter.current}`;
    const newToast = { 
      id, 
      message, 
      type, 
      title, 
      duration, 
      persistent, 
      actions, 
      icon, 
      onClose, 
      priority,
      createdAt: Date.now()
    };

    setToasts(prevToasts => {
      let updatedToasts = [...prevToasts];

      // Handle priority
      if (priority === 'high') {
        updatedToasts.unshift(newToast);
      } else {
        updatedToasts.push(newToast);
      }

      // Limit max toasts
      if (updatedToasts.length > maxToasts) {
        const toastsToRemove = updatedToasts.slice(0, updatedToasts.length - maxToasts);
        updatedToasts = updatedToasts.slice(-maxToasts);
        
        // Call onClose for removed toasts
        toastsToRemove.forEach(toast => {
          if (toast.onClose) toast.onClose(toast.id);
        });
      }

      return updatedToasts;
    });

    return id;
  }, [globalDuration, maxToasts]);

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => {
      const toast = prevToasts.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose(id);
      }
      return prevToasts.filter(toast => toast.id !== id);
    });
  }, []);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Update existing toast
  const updateToast = useCallback((id, updates) => {
    setToasts(prevToasts => 
      prevToasts.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  // Helper methods for different toast types
  const showSuccess = useCallback((options) => 
    addToast({ ...options, type: 'success' }), [addToast]);
  
  const showError = useCallback((options) => 
    addToast({ ...options, type: 'error' }), [addToast]);
  
  const showWarning = useCallback((options) => 
    addToast({ ...options, type: 'warning' }), [addToast]);
  
  const showInfo = useCallback((options) => 
    addToast({ ...options, type: 'info' }), [addToast]);

  const showLoading = useCallback((options) => 
    addToast({ ...options, type: 'loading', persistent: true }), [addToast]);

  const showCustom = useCallback((options) => 
    addToast({ ...options, type: 'custom' }), [addToast]);

  // Batch operations
  const showMultiple = useCallback((toastArray) => {
    toastArray.forEach((toastOptions, index) => {
      setTimeout(() => addToast(toastOptions), index * 100);
    });
  }, [addToast]);

  // Promise-based toast for async operations
  const promiseToast = useCallback(async (promise, options = {}) => {
    const {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Something went wrong'
    } = options;

    const loadingId = showLoading({ message: loading });

    try {
      const result = await promise;
      removeToast(loadingId);
      showSuccess({ message: typeof success === 'function' ? success(result) : success });
      return result;
    } catch (err) {
      removeToast(loadingId);
      showError({ message: typeof error === 'function' ? error(err) : error });
      throw err;
    }
  }, [showLoading, removeToast, showSuccess, showError]);

  const contextValue = {
    // Basic methods
    addToast,
    removeToast,
    clearAllToasts,
    updateToast,
    
    // Type-specific methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showCustom,
    
    // Advanced methods
    showMultiple,
    promiseToast,
    
    // State
    toasts: toasts.length,
    hasToasts: toasts.length > 0
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast container */}
      <div className={`fixed ${positions[position]} z-50 w-80 max-w-full pointer-events-none`}>
        <div className="space-y-2 pointer-events-auto">
          {toasts.map(toast => (
            <Toast 
              key={toast.id}
              {...toast}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Higher-order component for automatic error handling
export const withToastErrorHandler = (Component) => {
  return (props) => {
    const { showError } = useToast();
    
    const handleError = (error) => {
      showError({
        title: 'Error',
        message: error.message || 'An unexpected error occurred',
        duration: 7000
      });
    };

    return <Component {...props} onError={handleError} />;
  };
};

// Custom hook for form validation with toasts
export const useToastValidation = () => {
  const { showError, showSuccess } = useToast();
  
  const validateAndToast = (validationFn, successMessage) => {
    try {
      const result = validationFn();
      if (result === true) {
        showSuccess({ message: successMessage });
        return true;
      } else if (typeof result === 'string') {
        showError({ message: result });
        return false;
      }
      return result;
    } catch (error) {
      showError({ message: error.message });
      return false;
    }
  };

  return { validateAndToast };
};

export default ToastProvider;