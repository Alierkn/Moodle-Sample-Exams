import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Sparkles } from 'lucide-react';

/**
 * Modern Toast Notification Component
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the toast
 * @param {string} props.type - Type of toast (success, error, info, warning)
 * @param {string} props.message - Message to display
 * @param {string} props.title - Optional title for the toast
 * @param {Function} props.onClose - Function to call when toast is closed
 * @param {number} props.duration - Duration in ms before auto-closing (default: 5000)
 * @param {boolean} props.persistent - Whether toast should auto-close (default: false)
 * @param {string} props.position - Position of toast (top-right, top-left, bottom-right, bottom-left)
 */
const Toast = ({ 
  id, 
  type = 'info', 
  message, 
  title,
  onClose, 
  duration = 5000,
  persistent = false,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // Mount animation
  useEffect(() => {
    // Trigger entrance animation
    const mountTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(mountTimer);
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (persistent) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, persistent]);

  // Auto-close functionality
  useEffect(() => {
    if (persistent) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onClose, duration, persistent]);

  // Enhanced close handler with exit animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match exit animation duration
  };

  // Get icon based on type
  const getIcon = () => {
    const iconProps = { size: 20, className: "flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="flex-shrink-0 text-emerald-500" />;
      case 'error':
        return <AlertCircle {...iconProps} className="flex-shrink-0 text-red-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="flex-shrink-0 text-amber-500" />;
      case 'info':
      default:
        return <Info {...iconProps} className="flex-shrink-0 text-blue-500" />;
    }
  };

  // Toast styles based on type with modern design
  const getToastStyles = () => {
    const baseStyles = "relative overflow-hidden backdrop-blur-xl border shadow-xl rounded-2xl";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-emerald-50/90 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-500/30`;
      case 'error':
        return `${baseStyles} bg-red-50/90 dark:bg-red-900/20 border-red-200/50 dark:border-red-500/30`;
      case 'warning':
        return `${baseStyles} bg-amber-50/90 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-500/30`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50/90 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-500/30`;
    }
  };

  // Text colors based on type
  const getTextStyles = () => {
    switch (type) {
      case 'success':
        return 'text-emerald-800 dark:text-emerald-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-amber-800 dark:text-amber-200';
      case 'info':
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  // Progress bar color
  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  // Animation classes based on position and state
  const getAnimationClasses = () => {
    if (isExiting) {
      switch (position) {
        case 'top-left':
        case 'bottom-left':
          return 'animate-slide-out-left';
        case 'top-right':
        case 'bottom-right':
        default:
          return 'animate-slide-out-right';
      }
    }

    if (isVisible) {
      switch (position) {
        case 'top-left':
        case 'bottom-left':
          return 'animate-slide-in-left';
        case 'top-right':
        case 'bottom-right':
        default:
          return 'animate-slide-in-right';
      }
    }

    return 'opacity-0 transform translate-x-full';
  };

  return (
    <div 
      className={`
        ${getToastStyles()} 
        ${getAnimationClasses()}
        w-96 max-w-[calc(100vw-2rem)] p-4 mb-3 transform transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-2xl group cursor-pointer
      `}
      role="alert"
      aria-live="assertive"
      onClick={handleClose}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Progress bar */}
      {!persistent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200/30 dark:bg-gray-700/30 rounded-t-2xl overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} transition-all duration-100 ease-linear rounded-t-2xl`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex items-start gap-3 relative z-10">
        {/* Icon with animated background */}
        <div className="relative">
          <div className={`absolute inset-0 ${getProgressColor()} rounded-full opacity-20 animate-pulse`} />
          <div className="relative bg-white/70 dark:bg-gray-800/70 p-2 rounded-full backdrop-blur-sm shadow-sm">
            {getIcon()}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`font-semibold text-sm mb-1 ${getTextStyles()}`}>
              {title}
            </div>
          )}
          <div className={`text-sm leading-relaxed ${getTextStyles()}`}>
            {message}
          </div>
        </div>
        
        {/* Close button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="group/close relative p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          aria-label="Close notification"
        >
          <X 
            size={16} 
            className="text-gray-500 dark:text-gray-400 group-hover/close:text-gray-700 dark:group-hover/close:text-gray-200 group-hover/close:rotate-90 transition-all duration-200" 
          />
          
          {/* Hover effect */}
          <div className="absolute inset-0 bg-red-500/20 rounded-full opacity-0 group-hover/close:opacity-100 transition-opacity duration-200" />
        </button>
      </div>

      {/* Decorative elements for success type */}
      {type === 'success' && (
        <div className="absolute top-2 right-2 opacity-20">
          <Sparkles size={16} className="text-emerald-500 animate-pulse" />
        </div>
      )}

      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
      
      {/* Border glow effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 ${
        type === 'success' ? 'shadow-emerald-500/25' :
        type === 'error' ? 'shadow-red-500/25' :
        type === 'warning' ? 'shadow-amber-500/25' :
        'shadow-blue-500/25'
      } shadow-lg`} />
    </div>
  );
};

// Toast Container Component for positioning
export const ToastContainer = ({ children, position = 'top-right' }) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 pointer-events-none`}>
      <div className="pointer-events-auto space-y-3">
        {children}
      </div>
    </div>
  );
};

// Custom Animations
const styles = `
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slide-out-right {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-100%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slide-out-left {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-100%) scale(0.95);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.4s ease-out forwards;
}

.animate-slide-out-right {
  animation: slide-out-right 0.3s ease-in forwards;
}

.animate-slide-in-left {
  animation: slide-in-left 0.4s ease-out forwards;
}

.animate-slide-out-left {
  animation: slide-out-left 0.3s ease-in forwards;
}
`;

// Example usage component
export const ToastExample = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, title) => {
    const newToast = {
      id: Date.now(),
      type,
      message,
      title,
      duration: 5000
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="p-8 space-y-4">
      <style>{styles}</style>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => addToast('success', 'Operation completed successfully!', 'Success')}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Success Toast
        </button>
        <button
          onClick={() => addToast('error', 'Something went wrong. Please try again.', 'Error')}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Error Toast
        </button>
        <button
          onClick={() => addToast('warning', 'Please check your input before proceeding.', 'Warning')}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Warning Toast
        </button>
        <button
          onClick={() => addToast('info', 'New updates are available for download.', 'Information')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Info Toast
        </button>
      </div>

      <ToastContainer position="top-right">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            title={toast.title}
            onClose={removeToast}
            duration={toast.duration}
          />
        ))}
      </ToastContainer>
    </div>
  );
};

export default Toast;