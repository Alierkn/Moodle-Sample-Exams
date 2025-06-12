import React from 'react';

/**
 * Skeleton component for loading states
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.width - Width of the skeleton
 * @param {string} props.height - Height of the skeleton
 * @param {boolean} props.rounded - Whether to apply rounded corners
 * @param {boolean} props.circle - Whether to make the skeleton a circle
 */
const Skeleton = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4', 
  rounded = true, 
  circle = false 
}) => {
  return (
    <div 
      className={`
        bg-gray-200 animate-pulse 
        ${width} ${height} 
        ${rounded && !circle ? 'rounded' : ''} 
        ${circle ? 'rounded-full' : ''}
        ${className}
      `}
      aria-hidden="true"
    />
  );
};

/**
 * Text skeleton component for loading text
 * @param {Object} props - Component props
 * @param {number} props.lines - Number of lines to show
 * @param {string} props.className - Additional CSS classes
 */
export const TextSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array(lines).fill(0).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full'} 
          height="h-4" 
        />
      ))}
    </div>
  );
};

/**
 * Card skeleton component for loading cards
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hasImage - Whether to include an image placeholder
 * @param {number} props.lines - Number of text lines to show
 */
export const CardSkeleton = ({ className = '', hasImage = true, lines = 3 }) => {
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      {hasImage && (
        <Skeleton height="h-40" className="mb-4" />
      )}
      <Skeleton width="w-3/4" height="h-6" className="mb-2" />
      <TextSkeleton lines={lines} />
    </div>
  );
};

/**
 * Profile skeleton component for loading profile data
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 */
export const ProfileSkeleton = ({ className = '' }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center mb-6">
        <Skeleton width="w-20" height="h-20" circle className="mr-4" />
        <div className="flex-1">
          <Skeleton width="w-1/3" height="h-6" className="mb-2" />
          <Skeleton width="w-1/4" height="h-4" />
        </div>
      </div>
      <Skeleton width="w-full" height="h-32" className="mb-4" />
      <TextSkeleton lines={4} />
    </div>
  );
};

/**
 * Table skeleton component for loading tables
 * @param {Object} props - Component props
 * @param {number} props.rows - Number of rows to show
 * @param {number} props.columns - Number of columns to show
 * @param {string} props.className - Additional CSS classes
 */
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex border-b pb-2 mb-2">
        {Array(columns).fill(0).map((_, i) => (
          <div key={i} className={`flex-1 ${i !== 0 ? 'ml-2' : ''}`}>
            <Skeleton height="h-6" />
          </div>
        ))}
      </div>
      
      {/* Rows */}
      {Array(rows).fill(0).map((_, rowIndex) => (
        <div key={rowIndex} className="flex py-2 border-b">
          {Array(columns).fill(0).map((_, colIndex) => (
            <div key={colIndex} className={`flex-1 ${colIndex !== 0 ? 'ml-2' : ''}`}>
              <Skeleton height="h-4" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
