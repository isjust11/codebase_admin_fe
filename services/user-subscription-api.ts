import { axiosInstance } from "@/lib/axios";
import { UserSubscription, SubscriptionStatus } from "@/types/user-subscription";

interface PaginatedResponse {
  data: UserSubscription[];
  pagination: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

interface AdminListParams {
  page: number;
  size: number;
  search?: string;
  status?: SubscriptionStatus;
}

export const getUserSubscriptions = async (params: AdminListParams): Promise<PaginatedResponse> => {
  const response = await axiosInstance.get('/subscription/admin/list', { params });
  return response.data;
};

export const getUserSubscriptionById = async (id: string): Promise<UserSubscription> => {
  const response = await axiosInstance.get(`/subscription/admin/${id}`);
  return response.data;
};

export const assignSubscription = async (data: {
  userId: number;
  planId: number;
  status?: SubscriptionStatus;
}): Promise<UserSubscription> => {
  const response = await axiosInstance.post('/subscription/admin/assign', data);
  return response.data;
};

export const updateSubscriptionStatus = async (
  id: string,
  status: SubscriptionStatus,
): Promise<UserSubscription> => {
  const response = await axiosInstance.put(`/subscription/admin/${id}/status`, { status });
  return response.data;
};
