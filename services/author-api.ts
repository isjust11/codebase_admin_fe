import { axiosInstance } from './base/axios-instance';

export interface Author {
  id: number;
  name: string;
  slug: string;
  alias?: string;
  biography?: string;
  career?: string;
  achievements?: string;
  contributions?: string;
  works?: string;
  philosophy?: string;
  legacy?: string;
  birthDate?: Date;
  deathDate?: Date;
  birthPlace?: string;
  deathPlace?: string;
  era?: string;
  dynasty?: string;
  specialty?: string;
  teacher?: string;
  students?: string;
  portrait?: string;
  quotes?: string;
  anecdotes?: string;
  honors?: string;
  memorials?: string;
  references?: string;
  viewCount: number;
  likeCount: number;
  isActive: boolean;
  herbals?: any[];
  folkMedicines?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAuthorDto {
  name: string;
  alias?: string;
  biography?: string;
  career?: string;
  achievements?: string;
  contributions?: string;
  works?: string;
  philosophy?: string;
  legacy?: string;
  birthDate?: Date;
  deathDate?: Date;
  birthPlace?: string;
  deathPlace?: string;
  era?: string;
  dynasty?: string;
  specialty?: string;
  teacher?: string;
  students?: string;
  portrait?: string;
  quotes?: string;
  anecdotes?: string;
  honors?: string;
  memorials?: string;
  references?: string;
  isActive?: boolean;
}

export interface UpdateAuthorDto {
  name?: string;
  alias?: string;
  biography?: string;
  career?: string;
  achievements?: string;
  contributions?: string;
  works?: string;
  philosophy?: string;
  legacy?: string;
  birthDate?: Date;
  deathDate?: Date;
  birthPlace?: string;
  deathPlace?: string;
  era?: string;
  dynasty?: string;
  specialty?: string;
  teacher?: string;
  students?: string;
  portrait?: string;
  quotes?: string;
  anecdotes?: string;
  honors?: string;
  memorials?: string;
  references?: string;
  isActive?: boolean;
}

export interface AuthorPaginationResponse {
  data: Author[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}

export const getAllAuthors = async (params: { page: number; size: number; search?: string }): Promise<AuthorPaginationResponse> => {
  const response = await axiosInstance.get('/authors', { params });
  return response.data;
};

export const getAuthorById = async (id: number): Promise<Author> => {
  const response = await axiosInstance.get(`/authors/${id}`);
  return response.data;
};

export const createAuthor = async (data: CreateAuthorDto): Promise<Author> => {
  const response = await axiosInstance.post('/authors', data);
  return response.data;
};

export const updateAuthor = async (id: number, data: UpdateAuthorDto): Promise<Author> => {
  const response = await axiosInstance.patch(`/authors/${id}`, data);
  return response.data;
};

export const deleteAuthor = async (id: number): Promise<void> => {
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

export const incrementViewCount = async (id: number): Promise<void> => {
  await axiosInstance.post(`/authors/${id}/view`);
};

export const incrementLikeCount = async (id: number): Promise<void> => {
  await axiosInstance.post(`/authors/${id}/like`);
}; 