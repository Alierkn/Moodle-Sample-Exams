import React from 'react';

/**
 * Accessible form input component with proper ARIA attributes
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
 * @param {boolean} props.disabled - Whether input is disabled
 */
const FormInput = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  required = false,
  placeholder = '',
  error = '',
  helperText = '',
  disabled = false,
  className = '',
  ...rest
}) => {
  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        className={`
          shadow appearance-none border rounded w-full py-2 px-3 
          text-gray-700 leading-tight focus:outline-none focus:shadow-outline
          ${hasError ? 'border-red-500' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        {...rest}
      />
      
      {helperText && !hasError && (
        <p id={`${inputId}-helper`} className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}
      
      {hasError && (
        <p id={`${inputId}-error`} className="text-xs text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
