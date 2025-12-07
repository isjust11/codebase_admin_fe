export interface DiseaseDto {
  name: string;
  slug?: string;
  summary?: string;
  description?: string;
  symptoms?: string;
  causes?: string;
  prevention?: string;
  treatment?: string;
  authorId?: string;
  categoryId?: string;
  dataSourceId?: string;
  videoUrl?: string;
  isActive?: boolean;
  imagePaths?: string[];
}

