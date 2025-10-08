import { axiosInstance } from '@/lib/axios';
import { StaticPage } from '@/types/static-page';
import { StaticPageDto } from '@/types/dto/StaticPageDto';

export const getStaticPages = async (params?: PaginationParams): Promise<PaginatedResponse<StaticPage>> => {
  try {
    const response = await axiosInstance.get('/pages', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching static pages:', error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getStaticPage = async (id: string): Promise<StaticPage> => {
  const response = await axiosInstance.get(`/pages/${id}`);
  return response.data;
};

export const getStaticPageBySlug = async (slug: string): Promise<StaticPage> => {
  const response = await axiosInstance.get(`/pages/slug/${slug}`);
  return response.data;
};

export const createStaticPage = async (data: StaticPageDto): Promise<StaticPage> => {
  const response = await axiosInstance.post('/pages', data);
  return response.data;
};

export const updateStaticPage = async (id?: string, data?: StaticPageDto): Promise<StaticPage> => {
  const response = await axiosInstance.patch(`/pages/${id}`, data);
  return response.data;
};

export const deleteStaticPage = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/pages/${id}`);
};

export const toggleActiveStaticPage = async (id: string): Promise<StaticPage> => {
  const response = await axiosInstance.patch(`/pages/${id}/toggle-active`);
  return response.data;
};
