import React, { useState, useEffect } from 'react';
import { User, Lock, BookOpen, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/supabase';

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

  // Check for success message from registration
  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setSuccess(message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
    
    if (authError) {
      setError(authError);
    }
  }, [authError, location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      
      // Call Supabase auth service
      const { success, error, user } = await authService.login(email, password);
      
      if (success && user) {
        // Store user in local storage for persistence
        localStorage.setItem('user', JSON.stringify(user));
        
        // Call the onLogin callback if provided
        onLogin?.(user);
        
        setSuccess('Login successful! Redirecting...');
        
        // Redirect to dashboard or home page
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError(error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon: Icon, type, name, placeholder, value, onChange, showToggle }) => (
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 z-10 ${
        focusedField === name || value ? 'text-blue-400 scale-110' : 'text-gray-400'
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
            ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-gray-700/50' 
            : 'border-gray-600 hover:border-gray-500'
        } ${error && 'border-red-500/50'}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField('')}
      />
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200 z-10"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-500/10 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-cyan-500/10 rounded-full animate-bounce"></div>
        
        {/* Floating academic icons */}
        <div className="absolute top-32 right-1/3 text-blue-400/20 animate-float">
          <BookOpen size={32} />
        </div>
        <div className="absolute bottom-32 left-1/3 text-indigo-400/20 animate-float delay-1000">
          <GraduationCap size={28} />
        </div>
        <div className="absolute top-2/3 right-1/4 text-purple-400/20 animate-float delay-2000">
          <Sparkles size={24} />
        </div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main card with glassmorphism */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105">
          {/* Header section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 transform transition-all duration-300 hover:rotate-6">
              <BookOpen className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Moodle Exam Simulator
            </h2>
            <p className="text-gray-300 text-lg">
              Sign in to access your exams
            </p>
            <div className="mt-4">
              <span className="text-gray-400 text-sm">Don't have an account? </span>
              <button 
                onClick={() => navigate('/register')}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 underline decoration-2 underline-offset-4"
              >
                Create one here
              </button>
            </div>
          </div>

          {/* Success message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-2xl mb-6 backdrop-blur-sm animate-fadeIn">
              <div className="flex items-center">
                <CheckCircle size={20} className="mr-3 animate-pulse" />
                {success}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl mb-6 backdrop-blur-sm animate-shake">
              <div className="flex items-center">
                <AlertCircle size={20} className="mr-3" />
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            <InputField
              icon={User}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              icon={Lock}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showToggle={showPassword}
            />

            {/* Submit button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
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
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm mb-2">
              Secure exam environment
            </p>
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
              <span>• SSL Encrypted</span>
              <span>• Academic Integrity</span>
              <span>• 24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Academic stats card */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">500+</div>
            <div className="text-xs text-gray-400">Exams</div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400">98%</div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">10K+</div>
            <div className="text-xs text-gray-400">Students</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;