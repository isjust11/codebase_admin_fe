import { axiosInstance } from "@/lib/axios";
import { BookDto } from "@/types/dto/BookDto";
import { Book } from "@/types/book";

export const getBooksByPage = async (params: { page: number; size: number; search?: string; statusCode?: string }): Promise<PaginatedResponse<Book>> => {
  const response = await axiosInstance.get('/books/public', { params });
  return response.data;
};

export const getAllBooks = async (): Promise<Book[]> => {
  const response = await axiosInstance.get('/books/public');
  return response.data;
};

export const getBookById = async (id: string): Promise<Book> => {
  const response = await axiosInstance.get(`/books/${id}`);
  return response.data;
};

export const createBook = async (data: BookDto): Promise<Book> => {
  const response = await axiosInstance.post('/books', data);
  return response.data;
};

export const updateBook = async (id: string, data: Partial<BookDto>): Promise<Book> => {
  const response = await axiosInstance.put(`/books/${id}`, data);
  return response.data;
};

export const deleteBook = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/books/${id}`);
};

export const getBookStatistics = async (): Promise<{ total: number; pending: number; approved: number; rejected: number }> => {
  const response = await axiosInstance.get('/books/admin/statistics');
  return response.data;
};

export const updateBookStatus = async (id: string, statusCode: string): Promise<Book> => {
  const response = await axiosInstance.put(`/books/${id}/status`, { statusCode });
  return response.data;
};
