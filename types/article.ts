export interface Article {
    id?: string;
    title: string;
    content: string;
    thumbnail?: string;
    summary?: string;
    slug?: string;
    statusId?: string;
    categoryId?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  