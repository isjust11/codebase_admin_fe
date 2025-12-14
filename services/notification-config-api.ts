import { axiosInstance } from '@/lib/axios';
import { NotificationConfig } from '@/types/notification-config';
import { NotificationConfigDto } from '@/types/dto/NotificationConfigDto';

interface NotificationConfigParams extends PaginationParams {
  userId?: number;
}

export const getNotificationConfigs = async (params?: NotificationConfigParams): Promise<PaginatedResponse<NotificationConfig>> => {
  try {
    const response = await axiosInstance.get('/notification-configs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notification configs:', error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getNotificationConfig = async (id: string): Promise<NotificationConfig> => {
  const response = await axiosInstance.get(`/notification-configs/${id}`);
  return response.data;
};

export const getMyNotificationConfigs = async (params?: PaginationParams): Promise<PaginatedResponse<NotificationConfig>> => {
  try {
    const response = await axiosInstance.get('/notification-configs/my-configs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my notification configs:', error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getConfigByKey = async (key: string, userId?: number): Promise<NotificationConfig> => {
  const response = await axiosInstance.get(`/notification-configs/by-key/${key}`, {
    params: { userId }
  });
  return response.data;
};

export const getConfigValue = async (key: string, userId?: number, defaultValue?: any): Promise<any> => {
  const response = await axiosInstance.get(`/notification-configs/value/${key}`, {
    params: { userId, default: defaultValue }
  });
  return response.data.value;
};

export const createNotificationConfig = async (data: NotificationConfigDto): Promise<NotificationConfig> => {
  const response = await axiosInstance.post('/notification-configs', data);
  return response.data;
};

export const updateNotificationConfig = async (id?: string, data?: NotificationConfigDto): Promise<NotificationConfig> => {
  const response = await axiosInstance.patch(`/notification-configs/${id}`, data);
  return response.data;
};

export const deleteNotificationConfig = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/notification-configs/${id}`);
};

