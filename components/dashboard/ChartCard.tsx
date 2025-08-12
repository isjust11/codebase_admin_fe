import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiBarChart } from 'react-icons/fi';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  trend,
  className = ''
}) => {
  const getTrendIcon = () => {
    if (trend?.direction === 'up') return <FiTrendingUp className="w-4 h-4 text-green-500" />;
    if (trend?.direction === 'down') return <FiTrendingDown className="w-4 h-4 text-red-500" />;
    return <FiBarChart className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (trend?.direction === 'up') return 'text-green-600';
    if (trend?.direction === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend.direction === 'up' ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500">{trend.period}</span>
          </div>
        )}
      </div>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};
