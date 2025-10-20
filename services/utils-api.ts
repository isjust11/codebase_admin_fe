import { axiosInstance } from '@/lib/axios';

export const downloadFile = async (filename: string): Promise<any> => {
  const response = await axiosInstance.get(`/storage/file/${filename}`);
  return response.data;
};