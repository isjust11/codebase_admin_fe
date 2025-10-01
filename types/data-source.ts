export enum DataSourceType {
  WEBSITE = 'website',
  EBOOK = 'ebook',
  BOOK = 'book',
  JOURNAL = 'journal',
  RESEARCH_PAPER = 'research_paper',
  INTERVIEW = 'interview',
  DOCUMENT = 'document',
  OTHER = 'other'
}

export interface DataSource {
  id: number;
  name: string;
  title?: string;
  description?: string;
  type: DataSourceType;
  url?: string;
  author?: string;
  publisher?: string;
  publishDate?: string;
  isbn?: string;
  doi?: string;
  citation?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDataSourceDto {
  name: string;
  title?: string;
  description?: string;
  type: DataSourceType;
  url?: string;
  author?: string;
  publisher?: string;
  publishDate?: string;
  isbn?: string;
  doi?: string;
  citation?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateDataSourceDto extends Partial<CreateDataSourceDto> {
  id?: number;
}

export interface DataSourceTypeOption {
  value: DataSourceType;
  label: string;
}

