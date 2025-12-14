import { axiosInstance } from '@/lib/axios';
import { Notification } from '@/types/notification';
import { NotificationDto } from '@/types/dto/NotificationDto';

export const getNotifications = async (params?: PaginationParams): Promise<PaginatedResponse<Notification>> => {
  try {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getNotification = async (id: string): Promise<Notification> => {
  const response = await axiosInstance.get(`/notifications/${id}`);
  return response.data;
};

export const createNotification = async (data: NotificationDto): Promise<Notification> => {
  const response = await axiosInstance.post('/notifications', data);
  return response.data;
};

export const updateNotification = async (id?: string, data?: NotificationDto): Promise<Notification> => {
  const response = await axiosInstance.patch(`/notifications/${id}`, data);
  return response.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/notifications/${id}`);
};

