import { apiClient } from './base/api-client';
import { Category } from '@/types/category';

export const getCategories = async (params: {
  page: number;
  size: number;
  search?: string;
}) => {
  const response = await apiClient.get('/category', { params });
  return response.data;
};

export const getCategory = async (id: string) => {
  const response = await apiClient.get(`/category/${id}`);
  return response.data;
};

export const createCategory = async (data: Partial<Category>) => {
  const response = await apiClient.post('/category', data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  const response = await apiClient.put(`/category/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await apiClient.delete(`/category/${id}`);
  return response.data;
};

export const getAllCategories = async () => {
  const response = await apiClient.get('/category/all');
  return response.data;
}; 