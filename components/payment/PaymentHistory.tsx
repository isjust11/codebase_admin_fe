'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { paymentApi, Payment } from '@/services/payment-api';
import { toast } from 'sonner';

interface PaymentHistoryProps {
  userId?: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'stripe':
      return '💳';
    case 'vnpay':
      return '🏦';
    case 'momo':
      return '💜';
    case 'zalopay':
      return '💙';
    default:
      return '💰';
  }
};

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadPayments();
    }
  }, [userId]);

  const loadPayments = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await paymentApi.getPaymentsByUser(userId);
      setPayments(data);
    } catch (error: any) {
      toast.error('Failed to load payment history');
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>No payment records found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            You haven't made any payments yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Your recent payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getPaymentMethodIcon(payment.paymentMethod)}
                </div>
                <div>
                  <div className="font-medium">
                    {payment.description || `Payment #${payment.id}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold">
                  {payment.amount.toLocaleString('vi-VN')} VND
                </div>
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 