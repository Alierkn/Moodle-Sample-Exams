import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Check, X, AlertCircle, Info, ChevronRight, Sparkles } from 'lucide-react';

/**
 * Modern Accessible Button Component with Enhanced Features
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, danger, success, warning, outline, ghost, gradient)
 * @param {string} props.size - Button size (xs, sm, md, lg, xl)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {Function} props.onClick - Click handler function
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.ariaLabel - Accessible label for screen readers
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 * @param {string} props.loadingText - Text to show during loading
 * @param {boolean} props.rounded - Whether to use rounded corners
 * @param {boolean} props.shadow - Whether to apply shadow
 * @param {string} props.tooltip - Tooltip text
 * @param {React.ReactNode} props.children - Button content
 */
const AccessibleButton = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ariaLabel,
  leftIcon,
  rightIcon,
  loadingText,
  rounded = true,
  shadow = true,
  tooltip,
  className = '',
  children,
  ...rest
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  // Ripple effect handler
  const createRipple = (event) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  // Enhanced click handler
  const handleClick = (event) => {
    if (disabled || loading) return;
    
    createRipple(event);
    onClick?.(event);
  };

  // Keyboard handlers
  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      setIsPressed(true);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      setIsPressed(false);
      if (event.key === ' ') {
        event.preventDefault();
        handleClick(event);
      }
    }
  };

  // Enhanced variant styles with gradients and modern effects
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 
      hover:from-blue-700 hover:to-blue-800 
      focus:from-blue-700 focus:to-blue-800
      text-white shadow-blue-500/25
      hover:shadow-blue-500/40 focus:shadow-blue-500/40
    `,
    secondary: `
      bg-gradient-to-r from-gray-100 to-gray-200 
      hover:from-gray-200 hover:to-gray-300 
      focus:from-gray-200 focus:to-gray-300
      text-gray-800 shadow-gray-500/25
      hover:shadow-gray-500/40 focus:shadow-gray-500/40
      dark:from-gray-700 dark:to-gray-800 
      dark:hover:from-gray-600 dark:hover:to-gray-700
      dark:text-white
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 
      hover:from-red-700 hover:to-red-800 
      focus:from-red-700 focus:to-red-800
      text-white shadow-red-500/25
      hover:shadow-red-500/40 focus:shadow-red-500/40
    `,
    success: `
      bg-gradient-to-r from-emerald-600 to-emerald-700 
      hover:from-emerald-700 hover:to-emerald-800 
      focus:from-emerald-700 focus:to-emerald-800
      text-white shadow-emerald-500/25
      hover:shadow-emerald-500/40 focus:shadow-emerald-500/40
    `,
    warning: `
      bg-gradient-to-r from-amber-500 to-amber-600 
      hover:from-amber-600 hover:to-amber-700 
      focus:from-amber-600 focus:to-amber-700
      text-white shadow-amber-500/25
      hover:shadow-amber-500/40 focus:shadow-amber-500/40
    `,
    outline: `
      bg-transparent border-2 border-blue-500 
      text-blue-600 hover:bg-blue-50 focus:bg-blue-50
      hover:border-blue-600 focus:border-blue-600
      dark:text-blue-400 dark:hover:bg-blue-900/20 dark:focus:bg-blue-900/20
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 focus:bg-gray-100
      text-gray-700 dark:text-gray-300 
      dark:hover:bg-gray-800 dark:focus:bg-gray-800
    `,
    gradient: `
      bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 
      hover:from-purple-700 hover:via-pink-700 hover:to-blue-700
      focus:from-purple-700 focus:via-pink-700 focus:to-blue-700
      text-white shadow-purple-500/25
      hover:shadow-purple-500/40 focus:shadow-purple-500/40
      bg-[length:200%_200%] hover:bg-[position:100%_0%]
    `,
  };

  // Enhanced size styles
  const sizeStyles = {
    xs: 'py-1.5 px-3 text-xs min-h-[28px]',
    sm: 'py-2 px-4 text-sm min-h-[32px]',
    md: 'py-2.5 px-5 text-base min-h-[40px]',
    lg: 'py-3 px-6 text-lg min-h-[48px]',
    xl: 'py-4 px-8 text-xl min-h-[56px]',
  };

  // Icon sizes based on button size
  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  };

  // Get loading icon based on variant
  const getLoadingIcon = () => {
    switch (variant) {
      case 'success':
        return <Check size={iconSizes[size]} className="animate-spin" />;
      case 'danger':
        return <X size={iconSizes[size]} className="animate-spin" />;
      case 'warning':
        return <AlertCircle size={iconSizes[size]} className="animate-spin" />;
      default:
        return <Loader2 size={iconSizes[size]} className="animate-spin" />;
    }
  };

  // Enhanced focus and interaction states
  const interactionClasses = `
    transform transition-all duration-200 ease-out
    hover:scale-105 active:scale-95
    focus:outline-none focus:ring-4 focus:ring-offset-2
    ${variant === 'primary' ? 'focus:ring-blue-500/50' : ''}
    ${variant === 'secondary' ? 'focus:ring-gray-500/50' : ''}
    ${variant === 'danger' ? 'focus:ring-red-500/50' : ''}
    ${variant === 'success' ? 'focus:ring-emerald-500/50' : ''}
    ${variant === 'warning' ? 'focus:ring-amber-500/50' : ''}
    ${variant === 'outline' ? 'focus:ring-blue-500/50' : ''}
    ${variant === 'ghost' ? 'focus:ring-gray-500/50' : ''}
    ${variant === 'gradient' ? 'focus:ring-purple-500/50' : ''}
    ${isPressed ? 'scale-95' : ''}
  `;

  // Disabled and loading states
  const stateClasses = `
    ${disabled || loading ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : 'cursor-pointer'}
    ${loading ? 'pointer-events-none' : ''}
  `;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type={type}
        className={`
          relative overflow-hidden
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${rounded ? 'rounded-xl' : 'rounded-none'}
          ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
          ${interactionClasses}
          ${stateClasses}
          font-semibold
          inline-flex items-center justify-center gap-2
          ${className}
        `}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={disabled}
        aria-label={ariaLabel || undefined}
        aria-disabled={disabled}
        aria-busy={loading}
        {...rest}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}

        {/* Background overlay for hover effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl" />

        {/* Content */}
        <div className="relative flex items-center justify-center gap-2">
          {/* Left icon or loading icon */}
          {loading ? (
            <div className="flex items-center">
              {getLoadingIcon()}
            </div>
          ) : leftIcon ? (
            <div className="flex items-center">
              {React.cloneElement(leftIcon, { size: iconSizes[size] })}
            </div>
          ) : null}

          {/* Button text */}
          <span className={`${loading && loadingText ? 'block' : ''}`}>
            {loading && loadingText ? loadingText : children}
          </span>

          {/* Right icon */}
          {!loading && rightIcon && (
            <div className="flex items-center">
              {React.cloneElement(rightIcon, { size: iconSizes[size] })}
            </div>
          )}

          {/* Decorative sparkles for gradient variant */}
          {variant === 'gradient' && !loading && (
            <Sparkles size={iconSizes[size] - 4} className="opacity-70 animate-pulse" />
          )}
        </div>

        {/* Shine effect for gradient buttons */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
        )}
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg animate-fade-in-up">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
};

// Button Group Component
export const ButtonGroup = ({ children, className = '', orientation = 'horizontal' }) => {
  return (
    <div 
      className={`
        inline-flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
        ${orientation === 'horizontal' ? 'divide-x' : 'divide-y'} 
        overflow-hidden rounded-xl shadow-lg
        ${className}
      `}
      role="group"
    >
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          className: `${child.props.className || ''} ${
            orientation === 'horizontal' 
              ? 'rounded-none first:rounded-l-xl last:rounded-r-xl' 
              : 'rounded-none first:rounded-t-xl last:rounded-b-xl'
          }`,
          rounded: false,
        })
      )}
    </div>
  );
};

// Icon Button Component
export const IconButton = ({ 
  icon, 
  variant = 'ghost', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  };

  return (
    <AccessibleButton
      variant={variant}
      size={size}
      className={`aspect-square p-0 ${className}`}
      {...props}
    >
      {React.cloneElement(icon, { size: iconSizes[size] })}
    </AccessibleButton>
  );
};

// Demo component showcasing all button variants
export const ButtonShowcase = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const handleLoadingDemo = (variant) => {
    setLoadingStates(prev => ({ ...prev, [variant]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [variant]: false }));
    }, 2000);
  };

  const variants = ['primary', 'secondary', 'danger', 'success', 'warning', 'outline', 'ghost', 'gradient'];
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Enhanced Button Components
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Modern, accessible, and highly customizable button components
          </p>
        </div>

        {/* Variants showcase */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Button Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {variants.map(variant => (
              <AccessibleButton
                key={variant}
                variant={variant}
                onClick={() => handleLoadingDemo(variant)}
                loading={loadingStates[variant]}
                loadingText="Loading..."
                leftIcon={<Info />}
                tooltip={`${variant} button variant`}
              >
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </AccessibleButton>
            ))}
          </div>
        </div>

        {/* Sizes showcase */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-4">
            {sizes.map(size => (
              <AccessibleButton
                key={size}
                size={size}
                variant="primary"
                rightIcon={<ChevronRight />}
              >
                Size {size.toUpperCase()}
              </AccessibleButton>
            ))}
          </div>
        </div>

        {/* Special features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Button group */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Button Group</h2>
            <div className="space-y-4">
              <ButtonGroup>
                <AccessibleButton variant="outline">First</AccessibleButton>
                <AccessibleButton variant="outline">Second</AccessibleButton>
                <AccessibleButton variant="outline">Third</AccessibleButton>
              </ButtonGroup>
              
              <ButtonGroup orientation="vertical">
                <AccessibleButton variant="secondary">Top</AccessibleButton>
                <AccessibleButton variant="secondary">Middle</AccessibleButton>
                <AccessibleButton variant="secondary">Bottom</AccessibleButton>
              </ButtonGroup>
            </div>
          </div>

          {/* Icon buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Icon Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <IconButton icon={<Check />} variant="success" tooltip="Success" />
              <IconButton icon={<X />} variant="danger" tooltip="Delete" />
              <IconButton icon={<Info />} variant="outline" tooltip="Info" />
              <IconButton icon={<AlertCircle />} variant="warning" tooltip="Warning" />
            </div>
          </div>
        </div>

        {/* States showcase */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Button States</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AccessibleButton variant="primary">Normal</AccessibleButton>
            <AccessibleButton variant="primary" loading loadingText="Loading...">Loading</AccessibleButton>
            <AccessibleButton variant="primary" disabled>Disabled</AccessibleButton>
            <AccessibleButton variant="primary" fullWidth>Full Width</AccessibleButton>
          </div>
        </div>
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

export default AccessibleButton;