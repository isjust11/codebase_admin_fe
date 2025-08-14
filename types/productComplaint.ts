export interface ProductComplaint {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  productId?: number;
  userId?: number;
  product?: {
    id: number;
    title: string;
    thumbnail?: string;
    category?: {
      id: number;
      name: string;
      icon?: string;
    };
  };
  user?: {
    id: number;
    fullName?: string;
    email?: string;
  };
  category?: {
    id: number;
    name: string;
    icon?: string;
  };
}

