import React from 'react';
import { FiTrendingUp, FiEye, FiHeart, FiPackage, FiUser } from 'react-icons/fi';
import { TopPerformer } from '../../services/dashboard.service';

interface TopPerformersListProps {
  performers: TopPerformer[];
  type: string;
  title?: string;
  className?: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'products':
      return <FiPackage className="w-4 h-4 text-orange-500" />;
    case 'articles':
      return <FiTrendingUp className="w-4 h-4 text-indigo-500" />;
    case 'authors':
      return <FiUser className="w-4 h-4 text-pink-500" />;
    default:
      return <FiTrendingUp className="w-4 h-4 text-gray-500" />;
  }
};

const getTypeTitle = (type: string) => {
  switch (type) {
    case 'products':
      return 'Sản phẩm bán chạy';
    case 'articles':
      return 'Bài viết nổi bật';
    case 'authors':
      return 'Tác giả hàng đầu';
    default:
      return 'Top Performers';
  }
};

const formatMetric = (value?: number, type?: string) => {
  if (value === undefined) return '-';
  
  if (type === 'price') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }
  
  return value.toLocaleString();
};

export const TopPerformersList: React.FC<TopPerformersListProps> = ({
  performers,
  type,
  title,
  className = ''
}) => {
  const displayTitle = title || getTypeTitle(type);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        {getTypeIcon(type)}
        <h3 className="text-lg font-semibold text-gray-900">{displayTitle}</h3>
      </div>
      
      <div className="space-y-4">
        {performers.map((performer, index) => (
          <div key={performer.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {performer.name}
              </p>
              <div className="flex items-center space-x-4 mt-1">
                {performer.viewCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <FiEye className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatMetric(performer.viewCount)}
                    </span>
                  </div>
                )}
                
                {performer.soldCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <FiPackage className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatMetric(performer.soldCount)}
                    </span>
                  </div>
                )}
                
                {performer.likeCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <FiHeart className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatMetric(performer.likeCount)}
                    </span>
                  </div>
                )}
                
                {performer.articleCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <FiTrendingUp className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatMetric(performer.articleCount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {performer.price !== undefined && (
              <div className="flex-shrink-0">
                <span className="text-sm font-semibold text-green-600">
                  {formatMetric(performer.price, 'price')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {performers.length === 0 && (
        <div className="text-center py-8">
          <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      )}
    </div>
  );
};
