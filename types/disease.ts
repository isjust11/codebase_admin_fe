export interface Disease {
  id: string;
  name: string;
  slug: string;
  description?: string;
  symptoms?: string;
  causes?: string;
  prevention?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  folkMedicines?: Array<{
    id: string;
    title: string;
    slug?: string;
  }>;
}

export type DiseaseStatus = 'active' | 'inactive';

