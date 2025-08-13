import { useState, useEffect } from 'react';
import { Order } from '../types/order';
import { orderService } from '../services/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    } catch (err) {
      setError('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
  };
}; 