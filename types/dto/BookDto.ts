export interface BookDto {
  title: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  fileUrl: string;
  totalPages?: number;
  isbn?: string;
  publisher?: string;
  publishedDate?: string;
  language?: string;
  isPublic?: boolean;
  category?: string;
  categoryId?: number;
}
