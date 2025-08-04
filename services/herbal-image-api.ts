import axiosApi from './base/api';

export interface HerbalImageDto {
  id?: number;
  herbalId: string;
  url: string;
  type: 'main' | 'detail' | 'part' | 'growth' | 'processing' | 'usage' | 'other';
  sortOrder: number;
  alt?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SortOrderDto {
  id: number;
  sortOrder: number;
}

export const createHerbalImage = async (data: Omit<HerbalImageDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<HerbalImageDto> => {
  const response = await axiosApi.post('/herbal-images', data);
  return response.data;
};

export const getHerbalImages = async (herbalId: string): Promise<HerbalImageDto[]> => {
  const response = await axiosApi.get(`/herbal-images/herbal/${herbalId}`);
  return response.data;
};

export const getHerbalImage = async (id: string): Promise<HerbalImageDto> => {
  const response = await axiosApi.get(`/herbal-images/${id}`);
  return response.data;
};

export const updateHerbalImage = async (id: string, data: Partial<HerbalImageDto>): Promise<HerbalImageDto> => {
  const response = await axiosApi.patch(`/herbal-images/${id}`, data);
  return response.data;
};

export const deleteHerbalImage = async (id: string): Promise<void> => {
  await axiosApi.delete(`/herbal-images/${id}`);
};

export const deleteHerbalImages = async (herbalId: string): Promise<void> => {
  await axiosApi.delete(`/herbal-images/herbal/${herbalId}`);
};

export const updateHerbalImageSortOrder = async (images: SortOrderDto[]): Promise<void> => {
  await axiosApi.post('/herbal-images/sort-order', images);
};

export const getMainHerbalImage = async (herbalId: string): Promise<HerbalImageDto | null> => {
  try {
    const response = await axiosApi.get(`/herbal-images/herbal/${herbalId}/main`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getHerbalImagesByType = async (herbalId: string, type: string): Promise<HerbalImageDto[]> => {
  const response = await axiosApi.get(`/herbal-images/herbal/${herbalId}/type/${type}`);
  return response.data;
}; 