import { axiosInstance } from '@/lib/axios';
import { Article } from '@/types/article';


export interface ArticleDto {
  title: string;
  content: string;
  thumbnail?: string;
  description?: string;
  status?: string;
}


export const getArticles = async (params?: PaginationParams): Promise<PaginatedResponse<Article>> => {
  try {
    const response = await axiosInstance.get('/article', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
     return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getArticle = async (id: string): Promise<Article> => {
  const response = await axiosInstance.get(`/article/${id}`);
  return response.data;
};

export const createArticle = async (data: ArticleDto): Promise<Article> => {
  const response = await axiosInstance.post('/article', data);
  return response.data;
};

export const updateArticle = async (id?: string, data?: ArticleDto): Promise<Article> => {
  const response = await axiosInstance.put(`/article/${id}`, data);
  return response.data;
};

export const deleteArticle = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/article/${id}`);
};
 