export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'stripe' | 'vnpay' | 'momo' | 'zalopay' | 'cash';

export interface Payment {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    picture?: string;
  };
  planId?: string;
  plan?: {
    id: string;
    code: string;
    name: string;
    price?: number;
  };
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentIntentId?: string;
  gatewayTransactionId?: string;
  paymentUrl?: string;
  ipAddress?: string;
  gatewayResponse?: string;
  paidAt?: string;
  description?: string;
  metadata?: string;
  failureReason?: string;
  userSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
