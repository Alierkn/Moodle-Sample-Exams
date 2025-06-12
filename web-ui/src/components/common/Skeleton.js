import React from 'react';

/**
 * Modern Skeleton component for advanced loading states
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.width - Width of the skeleton
 * @param {string} props.height - Height of the skeleton
 * @param {boolean} props.rounded - Whether to apply rounded corners
 * @param {boolean} props.circle - Whether to make the skeleton a circle
 * @param {string} props.variant - Skeleton animation variant (pulse, wave, shimmer)
 * @param {string} props.theme - Theme variant (light, dark, glass)
 */
const Skeleton = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = true, 
  circle = false,
  variant = 'shimmer',
  theme = 'light'
}) => {
  // Get theme-specific classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-700 dark:bg-gray-800';
      case 'glass':
        return 'bg-white/10 backdrop-blur-sm border border-white/20';
      case 'light':
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    switch (variant) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-wave';
      case 'shimmer':
        return 'animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]';
      case 'glow':
        return 'animate-glow-pulse';
      default:
        return 'animate-pulse';
    }
  };

  return (
    <div 
      className={`
        ${getThemeClasses()}
        ${getAnimationClasses()}
        ${width} ${height} 
        ${rounded && !circle ? 'rounded-lg' : ''} 
        ${circle ? 'rounded-full aspect-square' : ''}
        relative overflow-hidden
        ${className}
      `}
      aria-hidden="true"
      role="presentation"
    >
      {/* Enhanced shimmer overlay */}
      {variant === 'shimmer' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-400/20 to-transparent animate-shimmer-move" />
      )}
      
      {/* Wave effect overlay */}
      {variant === 'wave' && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 dark:from-gray-700 via-gray-300 dark:via-gray-600 to-gray-200 dark:to-gray-700 animate-wave-move" />
      )}
    </div>
  );
};

/**
 * Enhanced Text skeleton component with smart sizing
 * @param {Object} props - Component props
 * @param {number} props.lines - Number of lines to show
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Animation variant
 * @param {boolean} props.randomWidth - Whether to use random widths for lines
 */
export const TextSkeleton = ({ 
  lines = 3, 
  className = '', 
  variant = 'shimmer',
  randomWidth = true 
}) => {
  const getRandomWidth = (index) => {
    if (!randomWidth) return 'w-full';
    
    const widths = ['w-full', 'w-11/12', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3'];
    const isLastLine = index === lines - 1;
    
    if (isLastLine && lines > 1) {
      return widths[Math.floor(Math.random() * 3) + 3]; // Shorter for last line
    }
    
    return widths[Math.floor(Math.random() * 3)]; // Longer for other lines
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {Array(lines).fill(0).map((_, i) => (
        <Skeleton 
          key={i} 
          width={getRandomWidth(i)}
          height="h-4" 
          variant={variant}
          className="transition-all duration-300"
        />
      ))}
    </div>
  );
};

/**
 * Enhanced Card skeleton with modern design
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hasImage - Whether to include an image placeholder
 * @param {number} props.lines - Number of text lines to show
 * @param {string} props.variant - Animation variant
 * @param {boolean} props.hasActions - Whether to include action buttons
 */
export const CardSkeleton = ({ 
  className = '', 
  hasImage = true, 
  lines = 3,
  variant = 'shimmer',
  hasActions = false 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Image placeholder */}
      {hasImage && (
        <Skeleton 
          height="h-48" 
          className="mb-6 rounded-xl" 
          variant={variant}
        />
      )}
      
      {/* Title placeholder */}
      <Skeleton 
        width="w-3/4" 
        height="h-6" 
        className="mb-4" 
        variant={variant}
      />
      
      {/* Content placeholders */}
      <TextSkeleton lines={lines} variant={variant} className="mb-6" />
      
      {/* Action buttons placeholder */}
      {hasActions && (
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Skeleton width="w-24" height="h-10" variant={variant} className="rounded-lg" />
          <Skeleton width="w-32" height="h-10" variant={variant} className="rounded-lg" />
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Profile skeleton with avatar and details
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Animation variant
 * @param {boolean} props.detailed - Whether to show detailed profile info
 */
export const ProfileSkeleton = ({ 
  className = '', 
  variant = 'shimmer',
  detailed = false 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
      {/* Header section */}
      <div className="flex items-center mb-8">
        {/* Avatar with decorative ring */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-30 animate-pulse" />
          <Skeleton 
            width="w-20" 
            height="h-20" 
            circle 
            variant={variant}
            className="relative"
          />
        </div>
        
        <div className="ml-6 flex-1">
          {/* Name */}
          <Skeleton 
            width="w-48" 
            height="h-7" 
            className="mb-2" 
            variant={variant}
          />
          {/* Role/Title */}
          <Skeleton 
            width="w-32" 
            height="h-5" 
            className="mb-2" 
            variant={variant}
          />
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <Skeleton width="w-3" height="h-3" circle variant={variant} />
            <Skeleton width="w-20" height="h-4" variant={variant} />
          </div>
        </div>
      </div>
      
      {/* Bio section */}
      <div className="mb-6">
        <Skeleton width="w-24" height="h-5" className="mb-3" variant={variant} />
        <Skeleton width="w-full" height="h-24" className="rounded-lg" variant={variant} />
      </div>
      
      {/* Stats or additional info */}
      {detailed && (
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton width="w-12" height="h-8" className="mx-auto mb-2" variant={variant} />
              <Skeleton width="w-16" height="h-4" className="mx-auto" variant={variant} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Table skeleton with header and data rows
 * @param {Object} props - Component props
 * @param {number} props.rows - Number of rows to show
 * @param {number} props.columns - Number of columns to show
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Animation variant
 * @param {boolean} props.hasActions - Whether to include action column
 */
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  className = '', 
  variant = 'shimmer',
  hasActions = true 
}) => {
  const totalColumns = hasActions ? columns + 1 : columns;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Table header */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${totalColumns}, 1fr)` }}>
          {Array(totalColumns).fill(0).map((_, i) => (
            <Skeleton 
              key={i} 
              height="h-5" 
              width={i === totalColumns - 1 && hasActions ? 'w-20' : 'w-3/4'}
              variant={variant}
            />
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array(rows).fill(0).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${totalColumns}, 1fr)` }}>
              {Array(totalColumns).fill(0).map((_, colIndex) => (
                <div key={colIndex} className="flex items-center">
                  {colIndex === totalColumns - 1 && hasActions ? (
                    // Actions column
                    <div className="flex gap-2">
                      <Skeleton width="w-8" height="h-8" variant={variant} className="rounded-lg" />
                      <Skeleton width="w-8" height="h-8" variant={variant} className="rounded-lg" />
                    </div>
                  ) : (
                    // Data column
                    <Skeleton 
                      height="h-4" 
                      width={`w-${Math.floor(Math.random() * 3) + 3}/4`}
                      variant={variant}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Dashboard skeleton with multiple sections
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Animation variant
 */
export const DashboardSkeleton = ({ className = '', variant = 'shimmer' }) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton width="w-64" height="h-8" className="mb-2" variant={variant} />
          <Skeleton width="w-48" height="h-5" variant={variant} />
        </div>
        <Skeleton width="w-32" height="h-10" variant={variant} className="rounded-lg" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Skeleton width="w-12" height="h-12" circle variant={variant} />
              <Skeleton width="w-16" height="h-6" variant={variant} />
            </div>
            <Skeleton width="w-20" height="h-8" className="mb-2" variant={variant} />
            <Skeleton width="w-32" height="h-4" variant={variant} />
          </div>
        ))}
      </div>
      
      {/* Chart section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <Skeleton width="w-40" height="h-6" className="mb-6" variant={variant} />
        <Skeleton width="w-full" height="h-64" variant={variant} className="rounded-lg" />
      </div>
    </div>
  );
};

/**
 * List skeleton for items with avatars
 * @param {Object} props - Component props
 * @param {number} props.items - Number of items to show
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Animation variant
 */
export const ListSkeleton = ({ 
  items = 5, 
  className = '', 
  variant = 'shimmer' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array(items).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <Skeleton width="w-12" height="h-12" circle variant={variant} />
          <div className="flex-1">
            <Skeleton width="w-3/4" height="h-5" className="mb-2" variant={variant} />
            <Skeleton width="w-1/2" height="h-4" variant={variant} />
          </div>
          <Skeleton width="w-20" height="h-8" variant={variant} className="rounded-lg" />
        </div>
      ))}
    </div>
  );
};

// Demo component to showcase all skeleton variants
export const SkeletonShowcase = () => {
  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen space-y-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Skeleton Components Showcase</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card Skeleton */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Card Skeleton</h2>
            <CardSkeleton hasActions />
          </div>
          
          {/* Profile Skeleton */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile Skeleton</h2>
            <ProfileSkeleton detailed />
          </div>
          
          {/* Table Skeleton */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Table Skeleton</h2>
            <TableSkeleton rows={4} columns={5} />
          </div>
          
          {/* List Skeleton */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">List Skeleton</h2>
            <ListSkeleton items={4} />
          </div>
          
          {/* Text Skeleton */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Text Skeleton</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <Skeleton width="w-3/4" height="h-6" className="mb-4" />
              <TextSkeleton lines={4} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes shimmer-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes wave-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-shimmer-move {
          animation: shimmer-move 2s infinite;
        }
        
        .animate-wave-move {
          animation: wave-move 1.5s infinite ease-in-out;
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Skeleton;