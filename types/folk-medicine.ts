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
  authorId?: string;
  author?: Author;
  categoryId?: string;
  category?: Category;
  dataSourceId?: string | null;
  dataSource?: DataSource;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  components?: FolkMedicineComponentDto[];
  ingredientsDetail?: FolkMedicineIngredient[];
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
  components?: FolkMedicineComponentDto[];
}

export interface UpdateFolkMedicineDto extends Partial<CreateFolkMedicineDto> {
  id: number;
} 

export interface FolkMedicineComponentDto {
  herbalId: string;
  quantity: number;
  unitCategoryId?: string;
  note?: string;
  sortOrder?: number;
}

export interface FolkMedicineIngredient {
  id: number;
  folkMedicineId: number;
  herbalId: number;
  quantity: number;
  note?: string;
  sortOrder: number;
  unitCategoryId?: number;
  herbal?: {
    id: number;
    title: string;
  };
  unitCategory?: Category;
}