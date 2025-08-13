import React from 'react';

interface FullScreenLoadingProps {
  isVisible: boolean;
  message?: string;
  variant?: 'default' | 'minimal' | 'fancy';
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progressValue?: number;
  className?: string;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({ 
  isVisible, 
  message = "Đang tải...",
  variant = 'default',
  size = 'medium',
  showProgress = false,
  progressValue = 0,
  className = ""
}) => {
  if (!isVisible) return null;

  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16',
    large: 'h-24 w-24'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
        );
      
      case 'fancy':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`}></div>
            <div className={`absolute inset-0 ${sizeClasses[size]} animate-spin rounded-full border-4 border-transparent border-t-blue-400`} style={{ animationDelay: '0.5s' }}></div>
          </div>
        );
      
      default:
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            </div>
          </div>
        );
    }
  };

  const renderProgress = () => {
    if (!showProgress) return null;
    
    return (
      <div className="w-64 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressValue}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300 ${className}`}>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-100 flex flex-col items-center space-y-4 max-w-sm mx-2">
        {/* Spinner */}
        <div className="flex items-center justify-center">
          {renderSpinner()}
        </div>
        
        {/* Loading message */}
        <div className="text-center">
          <p className="text-gray-800 text-lg font-medium mb-2">{message}</p>
          {variant === 'fancy' && (
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        {renderProgress()}
        
        {/* Optional: Additional info */}
        {variant === 'fancy' && (
          <div className="text-xs text-gray-500 text-center">
            Vui lòng chờ trong giây lát...
          </div>
        )}
      </div>
    </div>
  );
};

