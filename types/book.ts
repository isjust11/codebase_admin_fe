import { Category } from "./category";

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  fileUrl: string;
  totalPages?: number;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  language: string;
  isPublic: boolean;
  category?: Category;
  categoryId?: number;
  status?: Category;
  statusId?: number;
  createById?: number;
  createBy?: {
    id: number;
    fullName: string;
    email: string;
    picture?: string;
  };
  createdAt: string;
  updatedAt: string;
}
