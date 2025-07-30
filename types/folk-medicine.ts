export interface FolkMedicine {
  id: number;
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
  authorId?: number;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    code: string;
  };
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
  authorId?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface UpdateFolkMedicineDto extends Partial<CreateFolkMedicineDto> {
  id: number;
} 