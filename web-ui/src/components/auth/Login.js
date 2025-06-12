import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 

// Supabase servisi mock'landı, böylece bileşen bağımsız olarak çalışabilir.
const authService = {
  login: async (email, password) => {
    console.log("Attempting login with:", email);
    if (email === "test@example.com" && password === "password") {
      return { success: true, user: { id: '123', email: 'test@example.com' }, error: null };
    }
    return { success: false, user: null, error: 'Invalid email or password' };
  }
};

const Login = ({ onLogin, authError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(authError || '');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setSuccess(message);
      // State'i temizle
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (authError) setError(authError);
  }, [authError, location, navigate]);

  const handleEmailChange = useCallback(e => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback(e => setPassword(e.target.value), []);

  // Memoized form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const { success: ok, error: loginErr, user } = await authService.login(email, password);
      if (ok && user) {
        localStorage.setItem('user', JSON.stringify(user));
        if(onLogin) onLogin(user);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError(loginErr || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate, onLogin]);

  // Email input field with icon
  const EmailField = useCallback(() => (
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Mail size={20} />
      </div>
      <input
        id="email"
        name="email"
        type="email"
        required
        className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none backdrop-blur-sm ${
          focusedField === 'email' 
            ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-gray-700/50' 
            : 'border-gray-600 hover:border-gray-500'
        } ${error ? 'border-red-500/50' : ''}`}
        placeholder="Enter your email"
        value={email}
        onChange={handleEmailChange}
        onFocus={() => setFocusedField('email')}
        onBlur={() => setFocusedField('')}
        autoComplete="email"
      />
    </div>
  ), [email, error, focusedField, handleEmailChange]);

  // Password input field with icon and toggle
  const PasswordField = useCallback(() => (
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Lock size={20} />
      </div>
      <input
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        required
        className={`w-full pl-12 pr-12 py-4 bg-gray-800/50 border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none backdrop-blur-sm ${
          focusedField === 'password' 
            ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-gray-700/50' 
            : 'border-gray-600 hover:border-gray-500'
        } ${error ? 'border-red-500/50' : ''}`}
        placeholder="Enter your password"
        value={password}
        onChange={handlePasswordChange}
        onFocus={() => setFocusedField('password')}
        onBlur={() => setFocusedField('')}
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200 z-10"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  ), [error, focusedField, handlePasswordChange, password, showPassword]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-indigo-500/10 rounded-full animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-500/10 rounded-full animate-blob"></div>
          <div className="absolute bottom-1/2 right-10 w-20 h-20 bg-cyan-500/10 rounded-full animate-blob animation-delay-6000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="relative z-20 backdrop-blur-xl bg-gray-900/40 border border-white/10 rounded-3xl shadow-2xl p-8 transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 mt-2">Sign in to continue to your dashboard</p>
          </div>
          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-2xl mb-6 backdrop-blur-sm animate-fadeIn">
              <div className="flex items-center">
                <CheckCircle size={20} className="mr-3" />
                {success}
              </div>
            </div>
          )}
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl mb-6 backdrop-blur-sm animate-shake">
              <div className="flex items-center">
                <AlertCircle size={20} className="mr-3" />
                {error}
              </div>
            </div>
          )}
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <EmailField />
            <PasswordField />

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">Sign In</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform duration-200" size={20} />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer - Düzeltilmiş ve tamamlanmış kısım */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
