import React, { useState, useCallback } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Check, X, Shield, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/supabase';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  // Password strength checker - memoized to prevent unnecessary recalculations
  const checkPasswordStrength = useCallback((pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  }, []);

  // Memoized input handlers to prevent re-renders
  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value);
  }, []);
  
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);
  
  const handlePasswordChange = useCallback((e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  }, [checkPasswordStrength]);
  
  const handleConfirmPasswordChange = useCallback((e) => {
    setConfirmPassword(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Register with Supabase
      const { success, error, user } = await authService.register(email, password, username);
      
      if (success && user) {
        // Redirect to login with success message
        navigate('/login', { 
          state: { message: 'Registration successful! Please log in.' } 
        });
      } else {
        setError(error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  }, [username, email, password, confirmPassword, navigate, passwordStrength]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const InputField = ({ icon: Icon, type, name, placeholder, value, onChange, showToggle, hasStrength = false }) => (
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 z-10 ${
        focusedField === name || value ? 'text-emerald-400 scale-110' : 'text-gray-400'
      }`}>
        <Icon size={20} />
      </div>
      <input
        id={name}
        name={name}
        type={showToggle ? 'text' : type}
        required
        className={`w-full pl-12 pr-12 py-4 bg-gray-800/50 border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none backdrop-blur-sm ${
          focusedField === name 
            ? 'border-emerald-500 shadow-lg shadow-emerald-500/25 bg-gray-700/50' 
            : 'border-gray-600 hover:border-gray-500'
        } ${error && name === 'confirmPassword' && 'border-red-500/50'}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField('')}
      />
      {type === 'password' && (
        <button
          type="button"
          onClick={() => name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors duration-200 z-10"
        >
          {(name === 'password' ? showPassword : showConfirmPassword) ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
      
      {/* Password strength indicator */}
      {hasStrength && password && (
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Password Strength</span>
            <span className={`text-xs font-semibold ${
              passwordStrength <= 2 ? 'text-red-400' : 
              passwordStrength <= 3 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {getPasswordStrengthText()}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
              style={{ width: `${(passwordStrength / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center text-xs transition-colors duration-200 ${met ? 'text-green-400' : 'text-gray-500'}`}>
      {met ? <Check size={14} className="mr-2" /> : <X size={14} className="mr-2" />}
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-teal-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-500/10 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-green-500/10 rounded-full animate-bounce"></div>
        
        {/* Floating registration icons */}
        <div className="absolute top-32 right-1/3 text-emerald-400/20 animate-float">
          <UserPlus size={32} />
        </div>
        <div className="absolute bottom-32 left-1/3 text-teal-400/20 animate-float delay-1000">
          <Shield size={28} />
        </div>
        <div className="absolute top-2/3 right-1/4 text-cyan-400/20 animate-float delay-2000">
          <Star size={24} />
        </div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main registration card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105">
          {/* Header section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl mb-6 transform transition-all duration-300 hover:rotate-6">
              <UserPlus className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Join Our Community
            </h2>
            <p className="text-gray-300 text-lg">
              Create your account to get started
            </p>
            <div className="mt-4">
              <span className="text-gray-400 text-sm">Already have an account? </span>
              <button 
                onClick={() => navigate('/login')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200 underline decoration-2 underline-offset-4"
              >
                Sign in here
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl mb-6 backdrop-blur-sm animate-shake">
              <div className="flex items-center">
                <X size={20} className="mr-3" />
                {error}
              </div>
            </div>
          )}

          {/* Registration form */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                id="username"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${focusedField === 'username' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:outline-none transition-all duration-200`}
                placeholder="Choose a username"
                value={username}
                onChange={handleUsernameChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField('')}
                required
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                id="email"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${focusedField === 'email' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:outline-none transition-all duration-200`}
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border ${focusedField === 'password' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:outline-none transition-all duration-200`}
                placeholder="Create a secure password"
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password requirements */}
            {password && (
              <div className="bg-gray-800/30 border border-gray-600/30 rounded-2xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-300 mb-3">Password Requirements:</p>
                <PasswordRequirement met={password.length >= 8} text="At least 8 characters" />
                <PasswordRequirement met={/[A-Z]/.test(password)} text="One uppercase letter" />
                <PasswordRequirement met={/[a-z]/.test(password)} text="One lowercase letter" />
                <PasswordRequirement met={/[0-9]/.test(password)} text="One number" />
                <PasswordRequirement met={/[^A-Za-z0-9]/.test(password)} text="One special character" />
              </div>
            )}

            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border ${focusedField === 'confirmPassword' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600'} rounded-lg focus:outline-none transition-all duration-200`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField('')}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password match indicator */}
            {confirmPassword && (
              <div className={`flex items-center text-sm transition-colors duration-200 ${
                password === confirmPassword ? 'text-green-400' : 'text-red-400'
              }`}>
                {password === confirmPassword ? 
                  <Check size={16} className="mr-2" /> : 
                  <X size={16} className="mr-2" />
                }
                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || password !== confirmPassword || !password || !email || !username}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 group-hover:scale-110 transition-transform duration-200" size={20} />
                    <span>Create Account</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Benefits section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-gray-400 text-sm mb-4">What you'll get:</p>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center text-sm text-gray-300">
                <Sparkles size={16} className="mr-3 text-emerald-400" />
                <span>Access to premium exam content</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Shield size={16} className="mr-3 text-teal-400" />
                <span>Secure and encrypted data</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Star size={16} className="mr-3 text-cyan-400" />
                <span>Personalized learning experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs mb-2">Trusted by thousands of students worldwide</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <span>• GDPR Compliant</span>
            <span>• SSL Secured</span>
            <span>• 99.9% Uptime</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Register;