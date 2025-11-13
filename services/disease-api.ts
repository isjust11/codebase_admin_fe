import { axiosInstance } from '@/lib/axios';
import { Disease } from '@/types/disease';
import { DiseaseDto } from '@/types/dto/DiseaseDto';

export const getDiseases = async (params?: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<PaginatedResponse<Disease>> => {
  const response = await axiosInstance.get('/diseases', { params });
  return response.data;
};

export const getAllDiseases = async (): Promise<Disease[]> => {
  const response = await axiosInstance.get('/diseases/all');
  return response.data;
};

export const getDiseaseById = async (id: string): Promise<Disease> => {
  const response = await axiosInstance.get(`/diseases/${id}`);
  return response.data;
};

export const createDisease = async (payload: DiseaseDto): Promise<Disease> => {
  const response = await axiosInstance.post('/diseases', payload);
  return response.data;
};

export const updateDisease = async (id: string, payload: DiseaseDto): Promise<Disease> => {
  const response = await axiosInstance.patch(`/diseases/${id}`, payload);
  return response.data;
};

export const deleteDisease = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/diseases/${id}`);
};

