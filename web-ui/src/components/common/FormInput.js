import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, EyeOff, Check, X, AlertCircle, Info, Search, 
  Mail, User, Lock, Phone, Calendar, MapPin, CreditCard,
  Hash, Globe, ChevronDown
} from 'lucide-react';

/**
 * Modern Enhanced Form Input Component
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the input
 * @param {string} props.name - Input name
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.label - Input label
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether input is required
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {string} props.successText - Success message
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.variant - Input variant (default, filled, outlined)
 * @param {string} props.size - Input size (sm, md, lg)
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 * @param {React.ReactNode} props.rightIcon - Icon on the right
 * @param {boolean} props.loading - Loading state
 * @param {Array} props.options - Options for select input
 * @param {Function} props.onValidate - Custom validation function
 * @param {boolean} props.showValidation - Show validation icons
 * @param {string} props.mask - Input mask pattern
 * @param {number} props.maxLength - Maximum length
 * @param {boolean} props.autoComplete - Auto complete
 * @param {boolean} props.floating - Floating label style
 */
const FormInput = ({
  id,
  name,
  type = 'text',
  label,
  value = '',
  onChange,
  required = false,
  placeholder = '',
  error = '',
  helperText = '',
  successText = '',
  disabled = false,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  options = [],
  onValidate,
  showValidation = true,
  mask,
  maxLength,
  autoComplete = true,
  floating = false,
  className = '',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef(null);

  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);
  const hasSuccess = Boolean(successText) && !hasError;
  const hasValue = Boolean(internalValue);

  // Auto-validation
  useEffect(() => {
    if (onValidate && internalValue) {
      const validationResult = onValidate(internalValue);
      setIsValid(validationResult);
    } else if (required && internalValue) {
      setIsValid(internalValue.length > 0);
    }
  }, [internalValue, onValidate, required]);

  // Handle input change with masking
  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Apply mask if provided
    if (mask) {
      newValue = applyMask(newValue, mask);
    }
    
    // Apply max length
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    setInternalValue(newValue);
    
    // Call parent onChange with modified event
    const modifiedEvent = {
      ...e,
      target: { ...e.target, value: newValue }
    };
    onChange?.(modifiedEvent);
  };

  // Simple mask application
  const applyMask = (value, maskPattern) => {
    // Remove all non-numeric characters for phone mask
    if (maskPattern === 'phone') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length >= 10) {
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
      }
      return numbers;
    }
    return value;
  };

  // Get appropriate icon for input type
  const getTypeIcon = () => {
    const iconProps = { size: 18, className: "text-gray-400" };
    
    switch (type) {
      case 'email': return <Mail {...iconProps} />;
      case 'password': return <Lock {...iconProps} />;
      case 'tel': return <Phone {...iconProps} />;
      case 'search': return <Search {...iconProps} />;
      case 'url': return <Globe {...iconProps} />;
      case 'number': return <Hash {...iconProps} />;
      case 'date': return <Calendar {...iconProps} />;
      default: return leftIcon || <User {...iconProps} />;
    }
  };

  // Get validation icon
  const getValidationIcon = () => {
    if (!showValidation || (!hasError && !hasSuccess && isValid === null)) return null;
    
    if (hasError) {
      return <AlertCircle size={18} className="text-red-500" />;
    }
    if (hasSuccess || isValid === true) {
      return <Check size={18} className="text-green-500" />;
    }
    if (isValid === false) {
      return <X size={18} className="text-red-500" />;
    }
    return null;
  };

  // Size styles
  const sizeStyles = {
    sm: 'py-2 px-3 text-sm min-h-[36px]',
    md: 'py-3 px-4 text-base min-h-[44px]',
    lg: 'py-4 px-5 text-lg min-h-[52px]',
  };

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = `
      w-full rounded-xl transition-all duration-300 font-medium
      focus:outline-none focus:ring-4 focus:ring-offset-1
    `;

    switch (variant) {
      case 'filled':
        return `${baseStyles} 
          bg-gray-100 dark:bg-gray-800 border-2 border-transparent
          hover:bg-gray-200 dark:hover:bg-gray-700
          focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500
          text-gray-900 dark:text-white
          ${hasError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
          ${hasSuccess ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
        `;
      
      case 'outlined':
        return `${baseStyles}
          bg-transparent border-2 border-gray-300 dark:border-gray-600
          hover:border-gray-400 dark:hover:border-gray-500
          focus:border-blue-500 focus:bg-blue-50/50 dark:focus:bg-blue-900/20
          text-gray-900 dark:text-white
          ${hasError ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' : ''}
          ${hasSuccess ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20' : ''}
        `;
      
      default:
        return `${baseStyles}
          bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700
          hover:border-gray-300 dark:hover:border-gray-600
          focus:border-blue-500 focus:shadow-blue-500/20
          text-gray-900 dark:text-white shadow-sm
          ${hasError ? 'border-red-500 shadow-red-500/20' : ''}
          ${hasSuccess ? 'border-green-500 shadow-green-500/20' : ''}
        `;
    }
  };

  // Floating label styles
  const getLabelStyles = () => {
    if (!floating) {
      return "block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2";
    }
    
    return `
      absolute left-4 transition-all duration-300 pointer-events-none font-medium
      ${isFocused || hasValue 
        ? 'top-2 text-xs text-blue-600 dark:text-blue-400' 
        : 'top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400'
      }
    `;
  };

  // Render select dropdown
  if (type === 'select') {
    return (
      <div className={`relative ${className}`}>
        {label && !floating && (
          <label htmlFor={inputId} className={getLabelStyles()}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {floating && label && (
            <label htmlFor={inputId} className={getLabelStyles()}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          <select
            id={inputId}
            name={name}
            value={internalValue}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={`${getVariantStyles()} ${sizeStyles[size]} pr-10 appearance-none cursor-pointer`}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
          
          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown size={18} className="text-gray-400" />
          </div>
        </div>
        
        {/* Helper/Error text */}
        {(helperText || error || successText) && (
          <div className="mt-2 flex items-center gap-2">
            {hasError && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
            {hasSuccess && <Check size={14} className="text-green-500 flex-shrink-0" />}
            <p className={`text-xs ${hasError ? 'text-red-500' : hasSuccess ? 'text-green-500' : 'text-gray-500'}`}>
              {error || successText || helperText}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {label && !floating && (
        <label htmlFor={inputId} className={getLabelStyles()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {floating && label && (
          <label htmlFor={inputId} className={getLabelStyles()}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Left icon */}
        {(leftIcon || (!rightIcon && !floating)) && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {leftIcon || getTypeIcon()}
          </div>
        )}
        
        {/* Input field */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type={type === 'password' && showPassword ? 'text' : type}
          value={internalValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={floating ? '' : placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete ? 'on' : 'off'}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : 
            hasSuccess ? `${inputId}-success` :
            helperText ? `${inputId}-helper` : undefined
          }
          className={`
            ${getVariantStyles()} 
            ${sizeStyles[size]}
            ${leftIcon || (!rightIcon && !floating) ? 'pl-10' : ''}
            ${rightIcon || type === 'password' || getValidationIcon() ? 'pr-10' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${floating ? 'pt-6 pb-2' : ''}
          `}
          {...rest}
        />
        
        {/* Right side icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Loading spinner */}
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          
          {/* Password toggle */}
          {type === 'password' && !loading && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          
          {/* Custom right icon */}
          {rightIcon && !loading && type !== 'password' && (
            <div className="text-gray-400">
              {rightIcon}
            </div>
          )}
          
          {/* Validation icon */}
          {!loading && type !== 'password' && !rightIcon && getValidationIcon()}
        </div>
        
        {/* Character count */}
        {maxLength && (
          <div className="absolute bottom-1 right-3 text-xs text-gray-400">
            {internalValue.length}/{maxLength}
          </div>
        )}
      </div>
      
      {/* Helper/Error/Success text */}
      {(helperText || error || successText) && (
        <div className="mt-2 flex items-start gap-2">
          {hasError && <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />}
          {hasSuccess && <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />}
          {!hasError && !hasSuccess && helperText && (
            <Info size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
          )}
          <p 
            id={hasError ? `${inputId}-error` : hasSuccess ? `${inputId}-success` : `${inputId}-helper`}
            className={`text-xs leading-relaxed ${
              hasError ? 'text-red-500' : 
              hasSuccess ? 'text-green-500' : 
              'text-gray-500 dark:text-gray-400'
            }`}
            role={hasError ? 'alert' : undefined}
          >
            {error || successText || helperText}
          </p>
        </div>
      )}
    </div>
  );
};

// Textarea Component
export const FormTextarea = ({ 
  rows = 4, 
  resize = true, 
  autoResize = false,
  ...props 
}) => {
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight;
      setTextareaHeight(`${scrollHeight}px`);
    }
  }, [props.value, autoResize]);

  return (
    <div className={props.className}>
      {props.label && (
        <label htmlFor={props.id} className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={textareaRef}
        rows={rows}
        style={{ height: autoResize ? textareaHeight : undefined }}
        className={`
          w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-900 text-gray-900 dark:text-white
          py-3 px-4 transition-all duration-300 font-medium
          focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
          hover:border-gray-300 dark:hover:border-gray-600
          ${props.error ? 'border-red-500 shadow-red-500/20' : ''}
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${resize ? 'resize-y' : 'resize-none'}
        `}
        {...props}
      />
      
      {(props.helperText || props.error) && (
        <div className="mt-2 flex items-start gap-2">
          {props.error && <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />}
          <p className={`text-xs ${props.error ? 'text-red-500' : 'text-gray-500'}`}>
            {props.error || props.helperText}
          </p>
        </div>
      )}
    </div>
  );
};

// Demo component showcasing all form input features
export const FormInputShowcase = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    bio: '',
    website: '',
    age: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({});

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Demo validation
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Simulate API call
      setLoading({ submit: true });
      setTimeout(() => {
        setLoading({});
        alert('Form submitted successfully!');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Enhanced Form Components
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Modern, accessible, and feature-rich form inputs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Standard Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Standard Form</h2>
            
            <div className="space-y-6">
              <FormInput
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleChange('username')}
                error={errors.username}
                required
                leftIcon={<User size={18} />}
                helperText="Choose a unique username"
                showValidation
              />

              <FormInput
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange('email')}
                error={errors.email}
                required
                onValidate={validateEmail}
                helperText="We'll never share your email"
              />

              <FormInput
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange('password')}
                error={errors.password}
                required
                helperText="Minimum 6 characters"
                showValidation
              />

              <FormInput
                name="phone"
                type="tel"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
                mask="phone"
                helperText="Format: (555) 123-4567"
              />

              <FormInput
                name="country"
                type="select"
                label="Country"
                value={formData.country}
                onChange={handleChange('country')}
                options={[
                  { value: 'us', label: 'United States' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'ca', label: 'Canada' },
                  { value: 'au', label: 'Australia' }
                ]}
                placeholder="Select your country"
              />

              <button
                type="submit"
                disabled={loading.submit}
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                {loading.submit ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="space-y-8">
            {/* Floating Labels */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Floating Labels</h2>
              
              <div className="space-y-6">
                <FormInput
                  name="floating1"
                  label="Full Name"
                  floating
                  variant="outlined"
                />
                
                <FormInput
                  name="floating2"
                  type="email"
                  label="Email Address"
                  floating
                  variant="filled"
                />
              </div>
            </div>

            {/* Different Variants */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Input Variants</h2>
              
              <div className="space-y-6">
                <FormInput
                  name="default"
                  label="Default Style"
                  placeholder="Default input"
                  variant="default"
                />
                
                <FormInput
                  name="filled"
                  label="Filled Style"
                  placeholder="Filled input"
                  variant="filled"
                />
                
                <FormInput
                  name="outlined"
                  label="Outlined Style"
                  placeholder="Outlined input"
                  variant="outlined"
                />
              </div>
            </div>

            {/* Textarea */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Textarea</h2>
              
              <FormTextarea
                name="bio"
                label="Biography"
                value={formData.bio}
                onChange={handleChange('bio')}
                placeholder="Tell us about yourself..."
                helperText="Maximum 500 characters"
                autoResize
                maxLength={500}
              />
            </div>
          </div>
        </div>

        {/* Additional Examples */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Special Input Types</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              name="search"
              type="search"
              label="Search"
              placeholder="Search anything..."
              rightIcon={<Search size={18} />}
            />
            
            <FormInput
              name="website"
              type="url"
              label="Website"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleChange('website')}
            />
            
            <FormInput
              name="age"
              type="number"
              label="Age"
              placeholder="25"
              value={formData.age}
              onChange={handleChange('age')}
              min="0"
              max="120"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormInput;