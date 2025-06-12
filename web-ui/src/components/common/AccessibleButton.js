import React from 'react';

/**
 * Accessible button component with proper ARIA attributes and keyboard support
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, danger, success)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Function} props.onClick - Click handler function
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.ariaLabel - Accessible label for screen readers
 * @param {React.ReactNode} props.children - Button content
 */
const AccessibleButton = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  ariaLabel,
  className = '',
  children,
  ...rest
}) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 focus:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 focus:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 focus:bg-green-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 focus:bg-yellow-600 text-white',
    outline: 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50 focus:bg-blue-50',
  };

  // Size styles
  const sizeStyles = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  return (
    <button
      type={type}
      className={`
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${fullWidth ? 'w-full' : ''} 
        rounded font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || undefined}
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default AccessibleButton;
