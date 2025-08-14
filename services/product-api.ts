import axiosApi from './base/api';

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

export interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ProductFilter {
  page: number;
  size: number;
  search?: string;
}

export const getAllProducts = async (filter: ProductFilter): Promise<ProductResponse> => {
  const params = new URLSearchParams();
  params.append('page', filter.page.toString());
  params.append('size', filter.size.toString());
  if (filter.search) {
    params.append('search', filter.search);
  }

  const response = await axiosApi.get(`/products?${params.toString()}`);
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await axiosApi.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const response = await axiosApi.post('/products', product);
  return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  const response = await axiosApi.patch(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosApi.delete(`/products/${id}`);
};

