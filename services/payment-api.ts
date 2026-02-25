import { axiosInstance } from "@/lib/axios";
import { Payment, PaymentStatus, PaymentMethod } from "@/types/payment";

interface PaginatedResponse {
  data: Payment[];
  pagination: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

interface AdminListParams {
  page: number;
  size: number;
  search?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

export const getPayments = async (params: AdminListParams): Promise<PaginatedResponse> => {
  const response = await axiosInstance.get('/payment/admin/list', { params });
  return response.data;
};

export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await axiosInstance.get(`/payment/admin/${id}`);
  return response.data;
};

export const updatePaymentStatus = async (id: string, status: PaymentStatus): Promise<Payment> => {
  const response = await axiosInstance.put(`/payment/admin/${id}/status`, { status });
  return response.data;
};
