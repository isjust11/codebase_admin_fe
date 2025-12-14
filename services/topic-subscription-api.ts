import { axiosInstance } from '@/lib/axios';
import { TopicSubscription } from '@/types/topic-subscription';

export const getTopicSubscriptions = async (params?: PaginationParams): Promise<PaginatedResponse<TopicSubscription>> => {
  try {
    const response = await axiosInstance.get('/topic-subscriptions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching topic subscriptions:', error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getTopicSubscription = async (id: string): Promise<TopicSubscription> => {
  const response = await axiosInstance.get(`/topic-subscriptions/${id}`);
  return response.data;
};

export const deleteTopicSubscription = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/topic-subscriptions/${id}`);
};

