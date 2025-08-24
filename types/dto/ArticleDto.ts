
export interface ArticleDto {
    id?: string;
    createdBy?: string;
    updatedBy?: string;
    title: string;
    content: string;
    thumbnail?: string;
    summary?: string;
    statusId?: string;
    categoryId?: string;
  }
  