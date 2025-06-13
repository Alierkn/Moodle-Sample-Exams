import React from 'react';

// Simple Tabs component
export const Tabs = ({ defaultValue, className, children, ...props }) => {
  return (
    <div className={`tabs-container ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

// TabsList component - wrapper for tab triggers
export const TabsList = ({ className, children, ...props }) => {
  return (
    <div className={`tabs-list flex space-x-2 border-b ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

// TabsTrigger component - individual tab button
export const TabsTrigger = ({ value, className, active, onClick, children, ...props }) => {
  return (
    <button 
      className={`tabs-trigger px-4 py-2 ${active ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'} ${className || ''}`}
      onClick={() => onClick && onClick(value)}
      {...props}
    >
      {children}
    </button>
  );
};

// TabsContent component - content area for each tab
export const TabsContent = ({ value, activeValue, className, children, ...props }) => {
  const isActive = value === activeValue;
  
  return isActive ? (
    <div className={`tabs-content py-4 ${className || ''}`} {...props}>
      {children}
    </div>
  ) : null;
};

export default { Tabs, TabsList, TabsTrigger, TabsContent };
