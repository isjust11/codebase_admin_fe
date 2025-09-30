import { axiosInstance } from "@/lib/axios";
import { Author } from "@/types/author";
import { AuthorDto } from "@/types/dto/AuthorDto";


export const getAllAuthors = async (): Promise<Author[]> => {
  const response = await axiosInstance.get('/authors');
  return response.data;
};

export const getAuthorsByPage = async (params: { page?: number; size?: number; search?: string }):
 Promise<PaginatedResponse<Author>> => {
  const response = await axiosInstance.get('/authors', { params });
  return response.data;
};

export const getAuthorById = async (id: string): Promise<Author> => {
  const response = await axiosInstance.get(`/authors/${id}`);
  return response.data;
};

export const createAuthor = async (data: AuthorDto): Promise<Author> => {
  const response = await axiosInstance.post('/authors', data);
  return response.data;
};

export const updateAuthor = async (id: string, data: AuthorDto): Promise<Author> => {
  const response = await axiosInstance.patch(`/authors/${id}`, data);
  return response.data;
};

export const deleteAuthor = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/authors/${id}`);
};

export const getFamousAuthors = async (): Promise<Author[]> => {
  const response = await axiosInstance.get('/authors/famous');
  return response.data;
};

export const searchAuthors = async (query: string): Promise<Author[]> => {
  const response = await axiosInstance.get(`/authors/search/${query}`);
  return response.data;
};

export const getAuthorsByEra = async (era: string): Promise<Author[]> => {
  const response = await axiosInstance.get(`/authors/era/${era}`);
  return response.data;
};

export const getAuthorsByDynasty = async (dynasty: string): Promise<Author[]> => {
  const response = await axiosInstance.get(`/authors/dynasty/${dynasty}`);
  return response.data;
};

export const getAuthorsBySpecialty = async (specialty: string): Promise<Author[]> => {
  const response = await axiosInstance.get(`/authors/specialty/${specialty}`);
  return response.data;
};

export const getAuthorBySlug = async (slug: string): Promise<Author> => {
  const response = await axiosInstance.get(`/authors/slug/${slug}`);
  return response.data;
};

export const incrementViewCount = async (id: string): Promise<void> => {
  await axiosInstance.post(`/authors/${id}/view`);
};

export const incrementLikeCount = async (id: string): Promise<void> => {
  await axiosInstance.post(`/authors/${id}/like`);
}; 