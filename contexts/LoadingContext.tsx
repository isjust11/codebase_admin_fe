'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';

interface LoadingContextType {
  navigateTo: (path: string) => void;
  clearLoading: (path?: string) => void;
  isLoading: (path: string) => boolean;
  back: () => void;
  isPending: boolean;
  loadingPaths: Set<string>;
  showFullScreenLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  options?: {
    message?: string;
    variant?: 'default' | 'minimal' | 'fancy';
    size?: 'small' | 'medium' | 'large';
    showProgress?: boolean;
    className?: string;
  };
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ 
  children, 
  options = {} 
}) => {
  const loadingHook = useFullScreenLoading(options);

  return (
    <LoadingContext.Provider value={loadingHook}>
      {children}
      {/* Loading component được render ở đây */}
      <loadingHook.FullScreenLoadingComponent />
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 