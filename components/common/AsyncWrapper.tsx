import React, { Suspense } from 'react';

interface AsyncWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AsyncWrapper: React.FC<AsyncWrapperProps> = ({ 
  children, 
  fallback = (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  ) 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}; 