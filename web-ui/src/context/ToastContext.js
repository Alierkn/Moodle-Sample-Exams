import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

// Create context
const ToastContext = createContext();

/**
 * Toast provider component
 * Manages toast notifications throughout the application
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    return id;
  }, []);

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Helper methods for different toast types
  const showSuccess = useCallback((message, duration) => 
    addToast(message, 'success', duration), [addToast]);
  
  const showError = useCallback((message, duration) => 
    addToast(message, 'error', duration), [addToast]);
  
  const showWarning = useCallback((message, duration) => 
    addToast(message, 'warning', duration), [addToast]);
  
  const showInfo = useCallback((message, duration) => 
    addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ 
      addToast, 
      removeToast, 
      showSuccess, 
      showError, 
      showWarning, 
      showInfo 
    }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 w-72">
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={removeToast}
            duration={toast.duration}
          />
        ))}
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
