import { ChartNoAxesCombined, Eye } from 'lucide-react';
import React from 'react';
import { IconType } from 'react-icons';
import { 
  FiUsers, 
  FiShoppingCart, 
  FiDollarSign, 
  FiPackage,
  FiFileText,
  FiUserCheck,
} from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: IconType;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const iconMap = {
  users: FiUsers,
  orders: FiShoppingCart,
  revenue: FiDollarSign,
  products: FiPackage,
  articles: FiFileText,
  authors: FiUserCheck,
};

const colorMap = {
  users: 'from-blue-500 to-blue-600',
  orders: 'from-green-500 to-green-600',
  revenue: 'from-purple-500 to-purple-600',
  products: 'from-orange-500 to-orange-600',
  articles: 'from-indigo-500 to-indigo-600',
  authors: 'from-pink-500 to-pink-600',
  herbals: 'from-emerald-500 to-emerald-600',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'users',
  trend = 'neutral'
}) => {
  const IconComponent = icon || iconMap[color as keyof typeof iconMap];
  const bgGradient = colorMap[color as keyof typeof colorMap];

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()} {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500">so với tháng trước</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${bgGradient}`}>
          {/* <IconComponent icon={icon} className="w-6 h-6 text-white" /> */}
          <ChartNoAxesCombined  className='w-6 h-6 text-white'/>
        </div>
      </div>
    </div>
  );
};
