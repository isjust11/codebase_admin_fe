import axiosDownload from './base/api';

export const downloadFile = async (filename: string): Promise<any> => {
  const response = await axiosDownload.get(`/storage/file/${filename}`);
  return response.data;
};