import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Toast notification component
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the toast
 * @param {string} props.type - Type of toast (success, error, info, warning)
 * @param {string} props.message - Message to display
 * @param {Function} props.onClose - Function to call when toast is closed
 * @param {number} props.duration - Duration in ms before auto-closing (default: 5000)
 */
const Toast = ({ id, type = 'info', message, onClose, duration = 5000 }) => {
  // Auto-close after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  // Toast style based on type
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  return (
    <div 
      className={`${getToastStyles()} px-4 py-3 rounded border-l-4 shadow-md mb-3 flex justify-between items-center animate-fade-in`}
      role="alert"
    >
      <div>{message}</div>
      <button 
        onClick={() => onClose(id)} 
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
