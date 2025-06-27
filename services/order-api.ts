import axiosApi from './base/api';
import { CreateOrderDto } from '@/types/dto/CreateOrderDto';
import { Order } from '@/types/order';

export const createOrder = async (data: CreateOrderDto): Promise<Order> => {
  try {
    const response = await axiosApi.post('/orders', data);
    return response.data;
  } catch (_error) {
    console.error('Error creating order:', _error);
    throw _error;
  }
}; 