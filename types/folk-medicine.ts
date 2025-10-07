import { Author } from "./author";
import { Category } from "./category";
import { DataSource } from "./data-source";

export interface FolkMedicine {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  ingredients?: string;
  preparation?: string;
  usage?: string;
  notes?: string;
  thumbnail?: string;
  viewCount: number;
  likeCount: number;
  authorId?: string;
  author?: Author;
  categoryId?: string;
  category?: Category;
  dataSourceId?: string | null;
  dataSource?: DataSource;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolkMedicineDto {
  title: string;
  summary?: string;
  content: string;
  ingredients?: string;
  preparation?: string;
  usage?: string;
  notes?: string;
  thumbnail?: string;
  authorId?: string;
  categoryId?: string;
  dataSourceId?: number | null;
  isActive?: boolean;
}

export interface UpdateFolkMedicineDto extends Partial<CreateFolkMedicineDto> {
  id: number;
} 