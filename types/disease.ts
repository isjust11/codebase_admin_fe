export interface Disease {
  id: string;
  name: string;
  slug: string;
  summary?: string;
  description?: string;
  symptoms?: string;
  causes?: string;
  prevention?: string;
  treatment?: string;
  authorId?: number;
  categoryId?: number;
  dataSourceId?: number;
  videoUrl?: string;
  isActive: boolean;
  thumbnailUrl?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  dataSource?: {
    id: string;
    name: string;
  };
  folkMedicines?: Array<{
    id: string;
    title: string;
    slug?: string;
  }>;
}

export type DiseaseStatus = 'active' | 'inactive';

