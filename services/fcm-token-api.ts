import { axiosInstance } from '@/lib/axios';
import { FcmToken } from '@/types/fcm-token';
import { FcmTokenDto } from '@/types/dto/FcmTokenDto';

export const getFcmTokens = async (params?: PaginationParams): Promise<PaginatedResponse<FcmToken>> => {
  try {
    const response = await axiosInstance.get('/fcm-tokens', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching FCM tokens:', error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getFcmToken = async (id: string): Promise<FcmToken> => {
  const response = await axiosInstance.get(`/fcm-tokens/${id}`);
  return response.data;
};

export const registerFcmToken = async (data: FcmTokenDto): Promise<FcmToken> => {
  const response = await axiosInstance.post('/fcm-tokens/register', data);
  return response.data;
};

export const deleteFcmToken = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/fcm-tokens/${id}`);
};

export const deactivateFcmToken = async (id: string): Promise<void> => {
  await axiosInstance.patch(`/fcm-tokens/${id}/deactivate`);
};

