import { axiosInstance } from './base/axios-instance';

export interface Herbal {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  scientificName?: string;
  commonNames?: string;
  family?: string;
  partsUsed?: string;
  activeCompounds?: string;
  medicinalProperties?: string;
  preparationMethods?: string;
  dosage?: string;
  contraindications?: string;
  sideEffects?: string;
  thumbnail?: string;
  viewCount: number;
  likeCount: number;
  authorId?: string;
  category?: any;
  categoryId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHerbalDto {
  title: string;
  summary?: string;
  content: string;
  scientificName?: string;
  commonNames?: string;
  family?: string;
  partsUsed?: string;
  activeCompounds?: string;
  medicinalProperties?: string;
  preparationMethods?: string;
  dosage?: string;
  contraindications?: string;
  sideEffects?: string;
  thumbnail?: string;
  authorId?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface UpdateHerbalDto {
  title?: string;
  summary?: string;
  content?: string;
  scientificName?: string;
  commonNames?: string;
  family?: string;
  partsUsed?: string;
  activeCompounds?: string;
  medicinalProperties?: string;
  preparationMethods?: string;
  dosage?: string;
  contraindications?: string;
  sideEffects?: string;
  thumbnail?: string;
  authorId?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface HerbalPaginationResponse {
  data: Herbal[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}

export const getAllHerbals = async (params: { page: number; size: number; search?: string }): Promise<HerbalPaginationResponse> => {
  const response = await axiosInstance.get('/herbals', { params });
  return response.data;
};

export const getHerbalById = async (id: number): Promise<Herbal> => {
  const response = await axiosInstance.get(`/herbals/${id}`);
  return response.data;
};

export const createHerbal = async (data: CreateHerbalDto): Promise<Herbal> => {
  const response = await axiosInstance.post('/herbals', data);
  return response.data;
};

export const updateHerbal = async (id: number, data: UpdateHerbalDto): Promise<Herbal> => {
  const response = await axiosInstance.patch(`/herbals/${id}`, data);
  return response.data;
};

export const deleteHerbal = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/herbals/${id}`);
};

export const getHerbalsByCategory = async (categoryId: string): Promise<Herbal[]> => {
  const response = await axiosInstance.get(`/herbals/category/${categoryId}`);
  return response.data;
};

export const getHerbalsByScientificName = async (scientificName: string): Promise<Herbal[]> => {
  const response = await axiosInstance.get(`/herbals/scientific-name/${scientificName}`);
  return response.data;
};

export const getHerbalsByFamily = async (family: string): Promise<Herbal[]> => {
  const response = await axiosInstance.get(`/herbals/family/${family}`);
  return response.data;
};

export const incrementViewCount = async (id: number): Promise<void> => {
  await axiosInstance.post(`/herbals/${id}/view`);
};

export const incrementLikeCount = async (id: number): Promise<void> => {
  await axiosInstance.post(`/herbals/${id}/like`);
}; 