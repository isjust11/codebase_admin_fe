import axiosApi from './base/api';
import { Category } from '@/types/category';

export const getCategories = async (params: {
  page: number;
  size: number;
  search?: string;
}) => {
  const response = await axiosApi.get('/category', { params });
  return response.data;
};

export const getCategory = async (id: string) => {
  const response = await axiosApi.get(`/category/${id}`);
  return response.data;
};

export const createCategory = async (data: Partial<Category>) => {
  const response = await axiosApi.post('/category', data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  const response = await axiosApi.put(`/category/${id}`, data);
  return response.data;
};
