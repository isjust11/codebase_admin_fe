import { axiosInstance } from '@/lib/axios';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type TemplateType = 'WEDDING' | 'EVENT' | 'BIRTHDAY' | 'OTHER';

export interface EventDto {
  id?: number | string;
  title: string;
  slug?: string;
  type?: TemplateType;
  templateId?: string;
  eventDate?: string;
  venue?: string;
  coverImageUrl?: string;
  eventData?: Record<string, any>;
  status?: EventStatus;
}

type EventQuery = {
  page?: number;
  size?: number;
  search?: string;
};

export const getEvents = async (params?: EventQuery): Promise<any> => {
  try {
    const response = await axiosInstance.get('/events', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: [], total: 0, page: 1, size: 10, totalPages: 0 };
  }
};

export const getEvent = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/events/${id}`);
  return response.data;
};

export const createEvent = async (data: EventDto): Promise<any> => {
  const response = await axiosInstance.post('/events', data);
  return response.data;
};

export const updateEvent = async (id: string, data: EventDto): Promise<any> => {
  const response = await axiosInstance.put(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/events/${id}`);
};
