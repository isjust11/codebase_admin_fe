export interface Article {
    id: string;
    title: string;
    content: string;
    thumbnail?: string;
    description?: string;
    slug?: string;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  