import { axiosInstance } from '../lib/axios';

export interface CreatePaymentRequest {
  amount: number;
  currency?: string;
  paymentMethod: 'stripe' | 'vnpay' | 'momo' | 'zalopay';
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  id: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  paymentIntentId?: string;
  description?: string;
  createdAt: string;
  clientSecret?: string;
  paymentUrl?: string;
}

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  paymentIntentId?: string;
  gatewayResponse?: string;
  description?: string;
  metadata?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

class PaymentApiService {
  private baseUrl = '/payments';

  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await axiosInstance.post(`${this.baseUrl}/create`, data);
    return response.data;
  }

  async getPayment(paymentId: number): Promise<Payment> {
    const response = await axiosInstance.get(`${this.baseUrl}/${paymentId}`);
    return response.data;
  }

  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    const response = await axiosInstance.get(`${this.baseUrl}/user/${userId}`);
    return response.data;
  }

  async confirmStripePayment(paymentIntentId: string): Promise<Payment> {
    const response = await axiosInstance.post(`${this.baseUrl}/stripe/confirm`, {
      paymentIntentId,
    });
    return response.data;
  }
}

export const paymentApi = new PaymentApiService(); 