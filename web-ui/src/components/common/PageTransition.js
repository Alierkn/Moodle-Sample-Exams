import React, { useState, useEffect, useRef } from 'react';

/**
 * Modern Page Transition Component with Multiple Animation Variants
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to animate
 * @param {string} props.variant - Animation variant (fade, slide, scale, flip, rotate, curtain, split)
 * @param {string} props.direction - Direction for slide animations (up, down, left, right)
 * @param {number} props.duration - Animation duration in milliseconds
 * @param {string} props.easing - CSS easing function
 * @param {boolean} props.stagger - Whether to stagger child animations
 * @param {number} props.delay - Delay before animation starts
 */
const PageTransition = ({ 
  children, 
  variant = 'fade',
  direction = 'up',
  duration = 600,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  stagger = false,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = useRef(null);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Get animation classes based on variant and state
  const getAnimationClasses = () => {
    const baseClasses = `transition-all ease-out`;
    const durationClass = `duration-[${duration}ms]`;
    
    switch (variant) {
      case 'slide':
        return `${baseClasses} ${durationClass} ${getSlideClasses()}`;
      case 'scale':
        return `${baseClasses} ${durationClass} ${getScaleClasses()}`;
      case 'flip':
        return `${baseClasses} ${durationClass} ${getFlipClasses()}`;
      case 'rotate':
        return `${baseClasses} ${durationClass} ${getRotateClasses()}`;
      case 'curtain':
        return `${baseClasses} ${durationClass} ${getCurtainClasses()}`;
      case 'split':
        return `${baseClasses} ${durationClass} ${getSplitClasses()}`;
      case 'fade':
      default:
        return `${baseClasses} ${durationClass} ${getFadeClasses()}`;
    }
  };

  const getFadeClasses = () => {
    if (!isVisible) return 'opacity-0';
    return 'opacity-100';
  };

  const getSlideClasses = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up': return 'opacity-0 transform translate-y-8';
        case 'down': return 'opacity-0 transform -translate-y-8';
        case 'left': return 'opacity-0 transform translate-x-8';
        case 'right': return 'opacity-0 transform -translate-x-8';
        default: return 'opacity-0 transform translate-y-8';
      }
    }
    return 'opacity-100 transform translate-x-0 translate-y-0';
  };

  const getScaleClasses = () => {
    if (!isVisible) return 'opacity-0 transform scale-95';
    return 'opacity-100 transform scale-100';
  };

  const getFlipClasses = () => {
    if (!isVisible) return 'opacity-0 transform rotateY-90';
    return 'opacity-100 transform rotateY-0';
  };

  const getRotateClasses = () => {
    if (!isVisible) return 'opacity-0 transform rotate-12 scale-95';
    return 'opacity-100 transform rotate-0 scale-100';
  };

  const getCurtainClasses = () => {
    if (!isVisible) return 'opacity-0 transform scaleY-0';
    return 'opacity-100 transform scaleY-100';
  };

  const getSplitClasses = () => {
    if (!isVisible) return 'opacity-0 transform scaleX-0';
    return 'opacity-100 transform scaleX-100';
  };

  // Staggered animation for children
  const getStaggerDelay = (index) => {
    if (!stagger) return 0;
    return index * 100; // 100ms delay between each child
  };

  // Handle exit animation
  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
    }, duration);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${getAnimationClasses()}`}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: easing
      }}
    >
      {/* Background overlay for certain variants */}
      {(variant === 'curtain' || variant === 'split') && (
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 transition-opacity duration-${duration} ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} />
      )}

      {/* Main content */}
      <div className="relative z-10 w-full h-full">
        {stagger ? (
          <div className="space-y-4">
            {React.Children.map(children, (child, index) => (
              <div
                key={index}
                className={`transition-all duration-${duration} ${
                  isVisible 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-4'
                }`}
                style={{
                  transitionDelay: `${getStaggerDelay(index)}ms`,
                  transitionTimingFunction: easing
                }}
              >
                {child}
              </div>
            ))}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Decorative elements for enhanced visual appeal */}
      {variant === 'scale' && (
        <div className={`absolute inset-0 pointer-events-none transition-all duration-${duration} ${
          isVisible ? 'opacity-20 scale-100' : 'opacity-0 scale-150'
        }`}>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-lg" />
        </div>
      )}

      {/* Particle effect for special transitions */}
      {variant === 'flip' && isVisible && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/40 rounded-full animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Route Transition Wrapper with exit animations
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.routeKey - Unique key for route changes
 * @param {Object} props.transitionProps - Props to pass to PageTransition
 */
export const RouteTransition = ({ children, routeKey, ...transitionProps }) => {
  const [currentRoute, setCurrentRoute] = useState(routeKey);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (routeKey !== currentRoute) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentRoute(routeKey);
        setIsTransitioning(false);
      }, transitionProps.duration || 600);
    }
  }, [routeKey, currentRoute, transitionProps.duration]);

  return (
    <div className="relative w-full h-full">
      {!isTransitioning && (
        <PageTransition key={currentRoute} {...transitionProps}>
          {children}
        </PageTransition>
      )}
      
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

/**
 * Animated Section Component for within-page transitions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} props.inView - Whether the section is in view
 * @param {string} props.variant - Animation variant
 * @param {number} props.threshold - Intersection threshold
 */
export const AnimatedSection = ({ 
  children, 
  variant = 'fade',
  threshold = 0.1,
  className = ''
}) => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          }
        });
      },
      { threshold }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={sectionRef} className={className}>
      <PageTransition variant={variant} delay={0}>
        <div className={`transition-all duration-1000 ${
          inView 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-8'
        }`}>
          {children}
        </div>
      </PageTransition>
    </div>
  );
};

/**
 * Demo component showcasing all transition variants
 */
export const TransitionShowcase = () => {
  const [selectedVariant, setSelectedVariant] = useState('fade');
  const [selectedDirection, setSelectedDirection] = useState('up');
  const [key, setKey] = useState(0);

  const variants = [
    'fade', 'slide', 'scale', 'flip', 'rotate', 'curtain', 'split'
  ];

  const directions = ['up', 'down', 'left', 'right'];

  const triggerAnimation = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Page Transition Showcase
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore different animation variants for smooth page transitions
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Variant selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Animation Variant
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {variants.map(variant => (
                  <option key={variant} value={variant}>
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Direction selector (for slide variant) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Direction (for slide)
              </label>
              <select
                value={selectedDirection}
                onChange={(e) => setSelectedDirection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={selectedVariant !== 'slide'}
              >
                {directions.map(direction => (
                  <option key={direction} value={direction}>
                    {direction.charAt(0).toUpperCase() + direction.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Trigger button */}
            <div className="flex items-end">
              <button
                onClick={triggerAnimation}
                className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Trigger Animation
              </button>
            </div>
          </div>
        </div>

        {/* Demo area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden" style={{ height: '500px' }}>
          <PageTransition
            key={key}
            variant={selectedVariant}
            direction={selectedDirection}
            duration={800}
            stagger={selectedVariant === 'fade'}
          >
            <div className="p-12 h-full flex flex-col justify-center items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                <span className="text-3xl">🎨</span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)} Transition
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8">
                This demonstrates the {selectedVariant} animation variant 
                {selectedVariant === 'slide' && ` with ${selectedDirection} direction`}.
                Experience smooth, professional page transitions.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400">{i}</span>
                  </div>
                ))}
              </div>
            </div>
          </PageTransition>
        </div>

        {/* Animated sections demo */}
        <div className="mt-16 space-y-8">
          {[1, 2, 3].map(i => (
            <AnimatedSection key={i} variant="slide" className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Animated Section {i}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                This section animates into view when it enters the viewport. 
                Scroll down to see the intersection observer in action with smooth animations.
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(-5px) translateX(-5px);
          }
          75% {
            transform: translateY(-15px) translateX(3px);
          }
        }
        
        .animate-float {
          animation: float ease-in-out infinite;
        }
        
        .rotateY-90 {
          transform: rotateY(90deg);
        }
        
        .rotateY-0 {
          transform: rotateY(0deg);
        }
      `}</style>
    </div>
  );
};

export default PageTransition;