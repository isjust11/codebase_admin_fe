export interface StaticPage {
  id?: string;
  title: string;
  content: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  thumbnail?: string;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
