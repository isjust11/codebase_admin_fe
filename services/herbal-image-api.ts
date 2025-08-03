import { axiosInstance } from "@/lib/axios";

export interface HerbalImageDto {
  url: string;
  alt?: string;
  description?: string;
  type: 'main' | 'detail' | 'part' | 'growth' | 'processing' | 'usage' | 'other';
  sortOrder?: number;
  isActive?: boolean;
  herbalId: number;
}

export interface HerbalImageResponse {
  id: number;
  url: string;
  alt?: string;
  description?: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
  herbalId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SortOrderDto {
  id: number;
  sortOrder: number;
}

// Lấy tất cả hình ảnh của một herbal
export const getHerbalImages = async (herbalId: number): Promise<HerbalImageResponse[]> => {
  const response = await axiosInstance.get(`/herbal-images/herbal/${herbalId}`);
  return response.data;
};

// Lấy hình ảnh theo loại
export const getHerbalImagesByType = async (herbalId: number, type: string): Promise<HerbalImageResponse[]> => {
  const response = await axiosInstance.get(`/herbal-images/herbal/${herbalId}/type/${type}`);
  return response.data;
};

// Lấy hình ảnh chính
export const getMainHerbalImage = async (herbalId: number): Promise<HerbalImageResponse | null> => {
  const response = await axiosInstance.get(`/herbal-images/herbal/${herbalId}/main`);
  return response.data;
};

// Tạo hình ảnh mới
export const createHerbalImage = async (data: HerbalImageDto): Promise<HerbalImageResponse> => {
  const response = await axiosInstance.post('/herbal-images', data);
  return response.data;
};

// Cập nhật hình ảnh
export const updateHerbalImage = async (id: number, data: Partial<HerbalImageDto>): Promise<HerbalImageResponse> => {
  const response = await axiosInstance.patch(`/herbal-images/${id}`, data);
  return response.data;
};

// Xóa hình ảnh
export const deleteHerbalImage = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/herbal-images/${id}`);
};

// Xóa tất cả hình ảnh của một herbal
export const deleteHerbalImages = async (herbalId: number): Promise<void> => {
  await axiosInstance.delete(`/herbal-images/herbal/${herbalId}`);
};

// Cập nhật thứ tự sắp xếp
export const updateHerbalImageSortOrder = async (images: SortOrderDto[]): Promise<void> => {
  await axiosInstance.post('/herbal-images/sort-order', images);
}; 