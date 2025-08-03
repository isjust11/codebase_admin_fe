import { Herbal } from "./herbal";

export interface Author {
    id: number;
    name: string;
    slug: string;
    alias?: string;
    biography?: string;
    career?: string;
    achievements?: string;
    contributions?: string;
    works?: string;
    philosophy?: string;
    legacy?: string;
    birthDate?: Date;
    deathDate?: Date;
    birthPlace?: string;
    deathPlace?: string;
    era?: string;
    dynasty?: string;
    specialty?: string;
    teacher?: string;
    students?: string;
    portrait?: string;
    quotes?: string;
    anecdotes?: string;
    honors?: string;
    memorials?: string;
    references?: string;
    viewCount: number;
    likeCount: number;
    isActive: boolean;
    herbals?: Herbal[];
    folkMedicines?: Herbal[];
    createdAt: Date;
    updatedAt: Date;
  }