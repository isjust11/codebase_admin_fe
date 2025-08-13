import React from 'react';
import { Order } from '../types/order';

interface OrderListProps {
  orders: Order[];
  onOrderUpdate: (order: Order) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders }) => {

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Đơn hàng #{order.id}</h3>
            <span className={`px-2 py-1 rounded-full text-sm ${
              order.orderStatus.name === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              order.orderStatus.name === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {order.orderStatus.name}
            </span>
          </div>
          <div className="mt-2">
            <p className="text-gray-600">Thời gian: {new Date(order.createdAt).toLocaleString()}</p>
            <p className="text-gray-600">Tổng tiền: {order.totalAmount.toLocaleString()}đ</p>
          </div>
        </div>
      ))}
    </div>
  );
}; 