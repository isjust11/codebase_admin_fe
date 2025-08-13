import React from 'react';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';

// Component con chỉ sử dụng navigation
const NavigationComponent: React.FC = () => {
  const { navigateTo } = useLoading(); // Chỉ lấy navigateTo

  const handleNavigation = (path: string) => {
    navigateTo(path); // Loading sẽ hiển thị từ context
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Navigation Component</h3>
      <div className="space-y-3">
        <button
          onClick={() => handleNavigation('/dashboard')}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🏠 Đi đến Dashboard
        </button>
        <button
          onClick={() => handleNavigation('/users')}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          👥 Đi đến Users
        </button>
        <button
          onClick={() => handleNavigation('/settings')}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          ⚙️ Đi đến Settings
        </button>
      </div>
    </div>
  );
};

// Component khác cũng có thể sử dụng navigation
const AnotherComponent: React.FC = () => {
  const { navigateTo } = useLoading();

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Another Component</h3>
      <button
        onClick={() => navigateTo('/profile')}
        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
      >
        👤 Đi đến Profile
      </button>
    </div>
  );
};

// Layout chính với LoadingProvider
export const LoadingPatternExample: React.FC = () => {
  return (
    <LoadingProvider
      options={{
        variant: 'fancy',
        size: 'large',
        message: 'Đang chuyển trang...',
        showProgress: true
      }}
    >
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Loading Pattern Example
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NavigationComponent />
            <AnotherComponent />
          </div>
          
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">
              💡 Pattern này có ưu điểm gì?
            </h3>
            <ul className="text-blue-700 space-y-2">
              <li>✅ <strong>FullScreenLoadingComponent</strong> chỉ render ở layout ngoài</li>
              <li>✅ Các component con chỉ cần <strong>navigateTo</strong></li>
              <li>✅ Loading state được quản lý tập trung</li>
              <li>✅ Tránh re-render không cần thiết</li>
              <li>✅ UX nhất quán trên toàn bộ app</li>
            </ul>
          </div>
        </div>
      </div>
    </LoadingProvider>
  );
};
