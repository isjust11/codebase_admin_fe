import { axiosInstance } from "@/lib/axios";
import { HerbalDto } from "@/types/dto/HerbalDto";
import { Herbal } from "@/types/herbal";


export const getAllHerbals = async (params: { page: number; size: number; search?: string }): Promise<PaginatedResponse<Herbal>> => {
  const response = await axiosInstance.get('/herbals', { params });
  return response.data;
};

export const getHerbalById = async (id: number): Promise<Herbal> => {
  const response = await axiosInstance.get(`/herbals/${id}`);
  return response.data;
};

export const createHerbal = async (data: HerbalDto): Promise<Herbal> => {
  const response = await axiosInstance.post('/herbals', data);
  return response.data;
};

export const updateHerbal = async (id: number, data: HerbalDto): Promise<Herbal> => {
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