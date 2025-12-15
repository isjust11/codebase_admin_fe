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

export const registerFcmTokenBatch = async (data: FcmTokenDto[]): Promise<FcmToken[]> => {
  const response = await axiosInstance.post('/fcm-tokens/batch-register', data);
  return response.data;
};

export const deleteFcmToken = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/fcm-tokens/${id}`);
};

export const deactivateFcmToken = async (id: string): Promise<void> => {
  await axiosInstance.patch(`/fcm-tokens/${id}/deactivate`);
};

export interface SendFcmPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const sendFcmToToken = async (token: string, payload: SendFcmPayload) => {
  const response = await axiosInstance.post('/fcm-tokens/fcm/send-token', {
    token,
    ...payload,
  });
  return response.data;
};

export const sendFcmToTokens = async (tokens: string[], payload: SendFcmPayload) => {
  const response = await axiosInstance.post('/fcm-tokens/fcm/send-tokens', {
    tokens,
    ...payload,
  });
  return response.data;
};

// Topic subscription related APIs (for current user / admin tools)

export interface AvailableTopic {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export const getAvailableTopics = async (): Promise<AvailableTopic[]> => {
  const response = await axiosInstance.get('/fcm-tokens/available-topics');
  return response.data?.data || [];
};

export const batchSubscribeTopics = async (topics: string[]) => {
  const response = await axiosInstance.post('/fcm-tokens/batch-subscribe', { topics });
  return response.data;
};

export const checkTopicSubscription = async (topic: string) => {
  const response = await axiosInstance.get(`/fcm-tokens/check/${topic}`);
  return response.data?.data as { topic: string; isSubscribed: boolean };
};

// Get FCM tokens by userId
export const getFcmTokensByUserId = async (userId: number) => {
  const response = await axiosInstance.get(`/fcm-tokens/user/${userId}`);
  return response.data as FcmToken[];
};

// Get user's subscribed topics
export const getUserTopics = async (userId?: number) => {
  const response = await axiosInstance.get('/fcm-tokens/my-topics');
  return response.data?.data || [];
};

// Send FCM to topic
export const sendFcmToTopic = async (topic: string, payload: SendFcmPayload) => {
  const response = await axiosInstance.post('/fcm-tokens/fcm/send-topic', {
    topic,
    ...payload,
  });
  return response.data;
};

// Admin endpoints
export interface TopicStats {
  topic: string;
  subscriberCount: number;
  activeTokenCount?: number;
}

export const getTopicStats = async (topic: string): Promise<TopicStats> => {
  const response = await axiosInstance.get(`/fcm-tokens/admin/stats/${topic}`);
  return response.data?.data;
};

export const getAllTopicsStats = async (): Promise<TopicStats[]> => {
  const response = await axiosInstance.get('/fcm-tokens/admin/stats');
  return response.data?.data || [];
};

export interface TopicSubscribersResponse {
  topic: string;
  userIds: number[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export const getTopicSubscribers = async (
  topic: string,
  page: number = 1,
  size: number = 20
): Promise<TopicSubscribersResponse> => {
  const response = await axiosInstance.get(`/fcm-tokens/admin/subscribers/${topic}`, {
    params: { page, size },
  });
  return response.data?.data;
};

export const forceSubscribe = async (userId: number, topic: string) => {
  const response = await axiosInstance.post('/fcm-tokens/admin/force-subscribe', {
    userId,
    topic,
  });
  return response.data;
};

export const forceUnsubscribe = async (userId: number, topic: string) => {
  const response = await axiosInstance.post('/fcm-tokens/admin/force-unsubscribe', {
    userId,
    topic,
  });
  return response.data;
};

// CRUD Topics (assuming backend endpoints exist or will be created)
export interface TopicManagement {
  id?: string;
  topicId: string; // unique topic identifier
  name: string;
  description: string;
  icon: string;
  category: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getTopicsManagement = async (): Promise<TopicManagement[]> => {
  const response = await axiosInstance.get('/topics');
  return response.data?.data || [];
};

export const createTopic = async (data: Omit<TopicManagement, 'id' | 'createdAt' | 'updatedAt'>): Promise<TopicManagement> => {
  const response = await axiosInstance.post('/topics', data);
  return response.data;
};

export const updateTopic = async (id: string, data: Partial<TopicManagement>): Promise<TopicManagement> => {
  const response = await axiosInstance.patch(`/topics/${id}`, data);
  return response.data;
};

export const deleteTopic = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/topics/${id}`);
};


