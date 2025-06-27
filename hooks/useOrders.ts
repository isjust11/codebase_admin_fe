import { useState, useEffect } from 'react';
import { Order } from '../types/order';
import { orderService } from '../services/orderService';
import { useSocket } from './useSocket';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, subscribeToEvent } = useSocket();

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

  useEffect(() => {
    if (socket) {
      subscribeToEvent('orderUpdate', (updatedOrder: Order) => {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === updatedOrder.id ? updatedOrder : order
          )
        );
      });

      subscribeToEvent('newOrder', (newOrder: Order) => {
        setOrders(prevOrders => [...prevOrders, newOrder]);
      });
    }
  }, [socket, subscribeToEvent]);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
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