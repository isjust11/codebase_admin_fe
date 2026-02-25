import { SubscriptionPlan } from './subscription-plan';

export type SubscriptionStatus =
  | 'pending_payment'
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'trial'
  | 'payment_failed';

export interface UserSubscription {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    picture?: string;
  };
  planId: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt?: string;
  expiresAt?: string;
  paymentId?: string;
  payment?: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  };
  storageUsedBytes: string;
  ttsUsedInPeriod: number;
  convertUsedInPeriod: number;
  currentPeriodKey?: string;
  createdAt: string;
  updatedAt: string;
}
