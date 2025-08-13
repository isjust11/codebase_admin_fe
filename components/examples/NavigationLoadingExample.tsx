import React, { useState } from 'react';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useTranslations } from 'next-intl';

export const NavigationLoadingExample: React.FC = () => {
  const [variant, setVariant] = useState<'default' | 'minimal' | 'fancy'>('default');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showProgress, setShowProgress] = useState(false);
  const tUtils = useTranslations('Utils');
  const { navigateTo, FullScreenLoadingComponent } = useFullScreenLoading({
    message: tUtils('loading'),
    variant,
    size,
    showProgress
  });

  const handleNavigation = (path: string) => {
    navigateTo(path);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Navigation Loading Demo</h2>
      
      {/* Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Tùy chỉnh Loading</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="variant-select" className="block text-sm font-medium mb-2">Variant:</label>
            <select 
              id="variant-select"
              value={variant} 
              onChange={(e) => setVariant(e.target.value as any)}
              className="w-full p-2 border rounded"
              aria-label="Chọn kiểu loading"
            >
              <option value="default">Default</option>
              <option value="minimal">Minimal</option>
              <option value="fancy">Fancy</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="size-select" className="block text-sm font-medium mb-2">Size:</label>
            <select 
              id="size-select"
              value={size} 
              onChange={(e) => setSize(e.target.value as any)}
              className="w-full p-2 border rounded"
              aria-label="Chọn kích thước loading"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={showProgress}
                onChange={(e) => setShowProgress(e.target.checked)}
                className="mr-2"
                aria-label="Hiển thị thanh tiến trình"
              />
              Show Progress
            </label>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => handleNavigation('/dashboard')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🏠 Đi đến Dashboard
        </button>
        
        <button
          onClick={() => handleNavigation('/users')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          👥 Đi đến Users
        </button>
        
        <button
          onClick={() => handleNavigation('/settings')}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          ⚙️ Đi đến Settings
        </button>
      </div>
      
      {/* Info */}
      <div className="text-center text-gray-600">
        <p>Click vào các button trên để test loading full màn hình</p>
        <p className="text-sm mt-2">Bạn có thể thay đổi style loading bằng các tùy chọn ở trên</p>
      </div>
      
      {/* Component loading full màn hình */}
      <FullScreenLoadingComponent />
    </div>
  );
};
