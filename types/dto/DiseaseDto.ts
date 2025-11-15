export interface DiseaseDto {
  name: string;
  slug?: string;
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
  isActive?: boolean;
}

