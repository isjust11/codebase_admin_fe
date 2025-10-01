import axiosApi from './base/api';
import { DataSource, DataSourceType, DataSourceTypeOption } from '@/types/data-source';

export const getDataSources = async (params: {
  page: number;
  size: number;
  search?: string;
  type?: string;
}) => {
  const response = await axiosApi.get('/data-source', { params });
  return response.data;
};

export const getDataSource = async (id: string) => {
  const response = await axiosApi.get(`/data-source/${id}`);
  return response.data;
};

export const getAllDataSources = async () => {
  const response = await axiosApi.get('/data-source/all');
  return response.data;
};

export const getDataSourceTypes = async (): Promise<DataSourceTypeOption[]> => {
  const response = await axiosApi.get('/data-source/types');
  return response.data;
};

export const createDataSource = async (data: Partial<DataSource>) => {
  const response = await axiosApi.post('/data-source', data);
  return response.data;
};

export const updateDataSource = async (id: string, data: Partial<DataSource>) => {
  const response = await axiosApi.put(`/data-source/${id}`, data);
  return response.data;
};

export const deleteDataSource = async (id: string) => {
  const response = await axiosApi.delete(`/data-source/${id}`);
  return response.data;
};
