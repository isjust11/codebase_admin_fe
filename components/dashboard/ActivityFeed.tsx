import React from 'react';
import { FiClock, FiUser, FiShoppingCart, FiDollarSign } from 'react-icons/fi';
import { RecentActivity } from '../../services/dashboard.service';

interface ActivityFeedProps {
  activities: RecentActivity[];
  title?: string;
  className?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'order':
      return <FiShoppingCart className="w-4 h-4 text-green-500" />;
    case 'user':
      return <FiUser className="w-4 h-4 text-blue-500" />;
    case 'revenue':
      return <FiDollarSign className="w-4 h-4 text-purple-500" />;
    default:
      return <FiClock className="w-4 h-4 text-gray-500" />;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
  return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'Hoạt động gần đây',
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 leading-5">
                {activity.description}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {activity.user}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              {activity.amount && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(activity.amount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {activities.length === 0 && (
        <div className="text-center py-8">
          <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Không có hoạt động nào gần đây</p>
        </div>
      )}
    </div>
  );
};
