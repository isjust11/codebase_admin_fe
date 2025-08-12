
import { axiosInstance } from "@/lib/axios";
export interface DashboardOverview {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalArticles: number;
  totalAuthors: number;
  totalHerbals: number;
}

export interface DashboardStatistics {
  period: string;
  newUsers: number;
  newOrders: number;
  newRevenue: number;
  newProducts: number;
  newArticles: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  amount?: number;
  timestamp: string;
  user: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  viewCount?: number;
  soldCount?: number;
  likeCount?: number;
  articleCount?: number;
  price?: number;
}

export interface RevenueAnalytics {
  date: string;
  revenue: number;
  orders: number;
}

export interface UserGrowth {
  date: string;
  newUsers: number;
}

export class DashboardService {
  static async getOverview(): Promise<DashboardOverview> {
    const response = await axiosInstance.get('/dashboard/overview');
    return response.data;
  }

  static async getStatistics(period: string = '7d'): Promise<DashboardStatistics> {
    const response = await axiosInstance.get(`/dashboard/statistics?period=${period}`);
    return response.data;
  }

  static async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const response = await axiosInstance.get(`/dashboard/recent-activities?limit=${limit}`);
    return response.data;
  }

  static async getTopPerformers(type: string, limit: number = 5): Promise<TopPerformer[]> {
    const response = await axiosInstance.get(`/dashboard/top-performers?type=${type}&limit=${limit}`);
    return response.data;
  }

  static async getRevenueAnalytics(period: string = '30d'): Promise<RevenueAnalytics[]> {
    const response = await axiosInstance.get(`/dashboard/revenue-analytics?period=${period}`);
    return response.data;
  }

  static async getUserGrowth(period: string = '12m'): Promise<UserGrowth[]> {
    const response = await axiosInstance.get(`/dashboard/user-growth?period=${period}`);
    return response.data;
  }
}
