import { Order } from '../types/order';
import axiosApi from './base/api';
export const orderService = {
   async getOrders(): Promise<Order[]> {
    const response = await axiosApi.get(`/orders`);
    if (!response.data) {
      throw new Error('Failed to fetch orders');
    }
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await axiosApi.get(`/orders/${id}`);
    if (!response.data) {
      throw new Error('Failed to fetch order');
    }
    return response.data;
  },

  async updateOrderStatus(id: string, status: any): Promise<Order> {
    const response = await axiosApi.post(`/orders/${id}/status`,status);
    if (!response.data) {
      throw new Error('Failed to update order status');
    }
    return response.data;
  },

  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const response = await axiosApi.post(`/orders`,order,);
    if (!response.data) {
      throw new Error('Failed to create order');
    }
    return response.data;
  },
}; 