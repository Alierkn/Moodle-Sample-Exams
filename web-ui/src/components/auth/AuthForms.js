import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const AuthForms = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (isLogin) {
        // Simulated login
        if (formData.email && formData.password) {
          onAuthSuccess?.({ email: formData.email, id: 1 });
        } else {
          setError('Please fill in all fields');
        }
      } else {
        // Registration validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        // Simulated registration
        if (formData.username && formData.email && formData.password) {
          onAuthSuccess?.({ email: formData.email, username: formData.username, id: 1 });
        } else {
          setError('Please fill in all fields');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon: Icon, type, name, placeholder, value, required, showToggle, isPassword }) => (
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
        focusedField === name || value ? 'text-purple-500 scale-110' : 'text-gray-400'
      }`}>
        <Icon size={20} />
      </div>
      <input
        className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white group-hover:bg-gray-100 ${
          focusedField === name ? 'border-purple-500 shadow-lg shadow-purple-500/25 bg-white' : 'border-gray-200'
        } ${error && (name === 'password' || name === 'confirmPassword' || name === 'email') ? 'border-red-400' : ''}`}
        type={isPassword && !showToggle ? 'password' : type}
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField('')}
        placeholder={placeholder}
        required={required}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors duration-200"
        >
          {(name === 'password' ? showPassword : showConfirmPassword) ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full opacity-10 animate-spin" style={{animationDuration: '20s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105">
          {/* Header with animated icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 transform transition-transform duration-300 hover:rotate-12">
              <Sparkles className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join Us Today'}
            </h2>
            <p className="text-gray-300">
              {isLogin ? 'Sign in to your account' : 'Create your new account'}
            </p>
          </div>

          {/* Error message with animation */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl mb-6 backdrop-blur-sm animate-shake">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"></div>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Form fields with smooth transitions */}
            <div className={`transition-all duration-500 ${!isLogin ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              {!isLogin && (
                <InputField
                  icon={User}
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  required={!isLogin}
                />
              )}
            </div>

            <InputField
              icon={Mail}
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              required
            />

            <InputField
              icon={Lock}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              required
              showToggle={showPassword}
              isPassword
            />

            <div className={`transition-all duration-500 ${!isLogin ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              {!isLogin && (
                <InputField
                  icon={Lock}
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  required={!isLogin}
                  showToggle={showConfirmPassword}
                  isPassword
                />
              )}
            </div>

            {/* Submit button with loading animation */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform duration-200" size={20} />
                </div>
              )}
            </button>
            </div>

          {/* Toggle form type */}
          <div className="mt-8 text-center">
            <p className="text-gray-300 mb-3">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              type="button"
              onClick={toggleForm}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200 underline decoration-2 underline-offset-4 hover:decoration-purple-300"
            >
              {isLogin ? 'Create one now' : 'Sign in instead'}
            </button>
          </div>

          {/* Social login placeholder */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-center text-gray-400 text-sm">
              Secure authentication powered by modern encryption
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AuthForms;