import { apiClient } from './api-client';

export interface ProductComplaint {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductComplaintResponse {
  data: ProductComplaint[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ProductComplaintFilter {
  page: number;
  size: number;
  search?: string;
}

export const getAllProductComplaints = async (filter: ProductComplaintFilter): Promise<ProductComplaintResponse> => {
  const params = new URLSearchParams();
  params.append('page', filter.page.toString());
  params.append('size', filter.size.toString());
  if (filter.search) {
    params.append('search', filter.search);
  }

  const response = await apiClient.get(`/product-complaints?${params.toString()}`);
  return response.data;
};

export const getProductComplaintById = async (id: string): Promise<ProductComplaint> => {
  const response = await apiClient.get(`/product-complaints/${id}`);
  return response.data;
};

export const createProductComplaint = async (productComplaint: Partial<ProductComplaint>): Promise<ProductComplaint> => {
  const response = await apiClient.post('/product-complaints', productComplaint);
  return response.data;
};

export const updateProductComplaint = async (id: number, productComplaint: Partial<ProductComplaint>): Promise<ProductComplaint> => {
  const response = await apiClient.patch(`/product-complaints/${id}`, productComplaint);
  return response.data;
};

export const deleteProductComplaint = async (id: string): Promise<void> => {
  await apiClient.delete(`/product-complaints/${id}`);
};

