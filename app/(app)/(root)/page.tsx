'use client';

import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { TopPerformersList } from '@/components/dashboard/TopPerformersList';
import { DashboardOverview, DashboardService, DashboardStatistics, RecentActivity, TopPerformer } from '@/services/dashboard.service';
import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCalendar, FiTrendingUp, FiUsers } from 'react-icons/fi';

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<TopPerformer[]>([]);
  const [topArticles, setTopArticles] = useState<TopPerformer[]>([]);
  const [topAuthors, setTopAuthors] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        overviewData,
        statisticsData,
        activitiesData,
        topProductsData,
        topArticlesData,
        topAuthorsData,
      ] = await Promise.all([
        DashboardService.getOverview(),
        DashboardService.getStatistics(selectedPeriod),
        DashboardService.getRecentActivities(10),
        DashboardService.getTopPerformers('products', 5),
        DashboardService.getTopPerformers('articles', 5),
        DashboardService.getTopPerformers('authors', 5),
      ]);

      setOverview(overviewData);
      setStatistics(statisticsData);
      setActivities(activitiesData);
      setTopProducts(topProductsData);
      setTopArticles(topArticlesData);
      setTopAuthors(topAuthorsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Tổng quan hệ thống và thống kê</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-2">
              <FiCalendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="text-sm border-none outline-none bg-transparent"
                aria-label="Chọn khoảng thời gian"
              >
                <option value="7d">7 ngày qua</option>
                <option value="30d">30 ngày qua</option>
                <option value="90d">90 ngày qua</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng người dùng"
            value={overview.totalUsers}
            color="users"
            change={statistics?.newUsers ? Math.round((statistics.newUsers / overview.totalUsers) * 100) : undefined}
            trend={statistics?.newUsers ? 'up' : 'neutral'}
          />
          <StatCard
            title="Tổng đơn hàng"
            value={overview.totalOrders}
            color="orders"
            change={statistics?.newOrders ? Math.round((statistics.newOrders / overview.totalOrders) * 100) : undefined}
            trend={statistics?.newOrders ? 'up' : 'neutral'}
          />
          <StatCard
            title="Tổng doanh thu"
            value={overview.totalRevenue}
            color="revenue"
            change={statistics?.newRevenue ? Math.round((statistics.newRevenue / overview.totalRevenue) * 100) : undefined}
            trend={statistics?.newRevenue ? 'up' : 'neutral'}
          />
          <StatCard
            title="Tổng sản phẩm"
            value={overview.totalProducts}
            color="products"
            change={statistics?.newProducts ? Math.round((statistics.newProducts / overview.totalProducts) * 100) : undefined}
            trend={statistics?.newProducts ? 'up' : 'neutral'}
          />
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart */}
          <ChartCard
            title="Biểu đồ doanh thu"
            subtitle={`Doanh thu ${selectedPeriod === '7d' ? '7 ngày qua' : selectedPeriod === '30d' ? '30 ngày qua' : '90 ngày qua'}`}
            trend={{
              value: 12,
              direction: 'up',
              period: 'so với kỳ trước'
            }}
          >
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <FiTrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-500">Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
                <p className="text-sm text-gray-400">Cần tích hợp thư viện chart như Chart.js hoặc Recharts</p>
              </div>
            </div>
          </ChartCard>

          {/* User Growth Chart */}
          <ChartCard
            title="Tăng trưởng người dùng"
            subtitle="Số lượng người dùng mới theo thời gian"
            trend={{
              value: 8,
              direction: 'up',
              period: 'so với kỳ trước'
            }}
          >
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <FiUsers className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">Biểu đồ tăng trưởng người dùng sẽ được hiển thị ở đây</p>
                <p className="text-sm text-gray-400">Cần tích hợp thư viện chart như Chart.js hoặc Recharts</p>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Right Column - Lists */}
        <div className="space-y-8">
          {/* Recent Activities */}
          <ActivityFeed
            activities={activities}
            title="Hoạt động gần đây"
          />

          {/* Top Products */}
          <TopPerformersList
            performers={topProducts}
            type="products"
            title="Sản phẩm bán chạy"
          />

          {/* Top Articles */}
          <TopPerformersList
            performers={topArticles}
            type="articles"
            title="Bài viết nổi bật"
          />

          {/* Top Authors */}
          <TopPerformersList
            performers={topAuthors}
            type="authors"
            title="Tác giả hàng đầu"
          />
        </div>
      </div>

      {/* Additional Stats */}
      {overview && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Tổng bài viết"
            value={overview.totalArticles}
            color="articles"
          />
          <StatCard
            title="Tổng tác giả"
            value={overview.totalAuthors}
            color="authors"
          />
          <StatCard
            title="Tổng cây thuốc"
            value={overview.totalHerbals}
            color="herbals"
          />
        </div>
      )}
    </div>
  );
}
