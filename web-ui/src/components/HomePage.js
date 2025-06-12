import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code, TrendingUp, Zap, Target, Award, ChevronRight, Sparkles } from 'lucide-react';
import AccessibleButton from './common/AccessibleButton';

/**
 * Home page component with modern design and animations
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 */
const HomePage = ({ user }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Code,
      title: "Interactive Coding",
      description: "Solve real programming challenges with instant feedback and syntax highlighting.",
      gradient: "from-blue-500 to-cyan-500",
      delay: "delay-100"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Advanced progress tracking with detailed insights and performance metrics.",
      gradient: "from-purple-500 to-pink-500",
      delay: "delay-200"
    },
    {
      icon: Target,
      title: "Adaptive Learning",
      description: "Personalized challenges that adapt to your skill level and learning pace.",
      gradient: "from-emerald-500 to-teal-500",
      delay: "delay-300"
    }
  ];

  const stats = [
    { number: "10K+", label: "Challenges Solved" },
    { number: "95%", label: "Success Rate" },
    { number: "2.5K", label: "Active Users" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-700">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x / 10,
            top: mousePosition.y / 10,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-cyan-600/20 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-rose-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 px-4 py-12">
        {/* Hero Section */}
        <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>New AI-Powered Features Available</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
            Master Coding
            <br />
            <span className="relative">
              Like Never Before
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 animate-pulse" style={{ animationDelay: '1s', animationFillMode: 'forwards', animationName: 'scaleX' }} />
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the future of programming education with our revolutionary Moodle-inspired platform
          </p>

          {/* Stats Counter */}
          <div className="flex justify-center gap-8 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {user ? (
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <div className="group cursor-pointer">
                <Link to="/challenges">
                  <AccessibleButton
                    variant="primary"
                    size="lg"
                    className="relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-blue-500/25"
                    ariaLabel="Start practicing coding challenges"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    <Code size={24} className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Start Your Journey</span>
                    <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </AccessibleButton>
                </Link>
              </div>

              <div className="group cursor-pointer">
                <Link to="/documents">
                  <AccessibleButton
                    variant="success"
                    size="lg"
                    className="relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-emerald-500/25"
                    ariaLabel="View documentation and learning resources"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    <BookOpen size={24} className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Explore Resources</span>
                    <Sparkles size={20} className="ml-2 group-hover:scale-125 transition-transform duration-300" />
                  </AccessibleButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mb-16">
              <div className="group cursor-pointer">
                <Link to="/login">
                  <AccessibleButton
                    variant="primary"
                    size="lg"
                    className="relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-blue-500/25"
                    ariaLabel="Login to start using the application"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    <Zap size={24} className="mr-3 group-hover:scale-125 transition-transform duration-300" />
                    <span className="relative z-10">Login to Unlock</span>
                    <Award size={20} className="ml-2 group-hover:rotate-12 transition-transform duration-300" />
                  </AccessibleButton>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 dark:border-gray-700/30 animate-fade-in-up ${feature.delay}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-gray-700/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ChevronRight size={20} className="text-blue-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-full border border-blue-200/30 dark:border-blue-700/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Join thousands of developers already improving their skills
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleX {
          to {
            transform: scaleX(1);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
