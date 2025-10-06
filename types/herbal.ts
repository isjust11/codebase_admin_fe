import { Category } from "./category";

export interface Herbal {
    id: string;
    title: string;
    slug: string;
    summary?: string;
    content: string;
    scientificName?: string;
    commonNames?: string;
    family?: string;
    partsUsed?: string;
    activeCompounds?: string;
    medicinalProperties?: string;
    preparationMethods?: string;
    dosage?: string;
    contraindications?: string;
    sideEffects?: string;
    thumbnail?: string;
    viewCount: number;
    likeCount: number;
    authorId?: string;
    category?: Category;
    categoryId?: string;
    dataSourceId?: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }