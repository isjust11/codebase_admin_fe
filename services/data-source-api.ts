import { axiosInstance } from '@/lib/axios';
import { DataSource, DataSourceTypeOption } from '@/types/data-source';

export const getDataSources = async (params: {
  page: number;
  size: number;
  search?: string;
  type?: string;
}) => {
  const response = await axiosInstance.get('/data-source', { params });
  return response.data;
};

export const getDataSource = async (id: string) => {
  const response = await axiosInstance.get(`/data-source/${id}`);
  return response.data;
};

export const getAllDataSources = async () => {
  const response = await axiosInstance.get('/data-source/all');
  return response.data;
};

export const getDataSourceTypes = async (): Promise<DataSourceTypeOption[]> => {
  const response = await axiosInstance.get('/data-source/types');
  return response.data;
};

export const createDataSource = async (data: Partial<DataSource>) => {
  const response = await axiosInstance.post('/data-source', data);
  return response.data;
};

export const updateDataSource = async (id: string, data: Partial<DataSource>) => {
  const response = await axiosInstance.put(`/data-source/${id}`, data);
  return response.data;
};

export const deleteDataSource = async (id: string) => {
  const response = await axiosInstance.delete(`/data-source/${id}`);
  return response.data;
};

