export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  isActive: boolean;
  categoryId: number;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

