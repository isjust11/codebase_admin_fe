import { axiosInstance } from '@/lib/axios';
import { FolkMedicine } from '@/types/folk-medicine';

export const getFolkMedicines = async (params: {
  page: number;
  size: number;
  search?: string;
}) => {
  const response = await axiosInstance.get('/folk-medicine', { params });
  return response.data;
};

export const getFolkMedicine = async (id: string) => {
  const response = await axiosInstance.get(`/folk-medicine/${id}`);
  return response.data;
};

export const createFolkMedicine = async (data: Partial<FolkMedicine>) => {
  const response = await axiosInstance.post('/folk-medicine', data);
  return response.data;
};

export const updateFolkMedicine = async (id: string, data: Partial<FolkMedicine>) => {
  const response = await axiosInstance.put(`/folk-medicine/${id}`, data);
  return response.data;
};

export const deleteFolkMedicine = async (id: string) => {
  const response = await axiosInstance.delete(`/folk-medicine/${id}`);
  return response.data;
};

export const getAllFolkMedicines = async () => {
  const response = await axiosInstance.get('/folk-medicine/all');
  return response.data;
};

export const getFolkMedicinesByCategory = async (categoryId: string) => {
  const response = await axiosInstance.get(`/folk-medicine/category/${categoryId}`);
  return response.data;
}; 