export type PlanCode = 'basic' | 'advanced' | 'ultra';

export interface SubscriptionPlan {
  id: string;
  code: PlanCode;
  name: string;
  description?: string;
  nameEn: string;
  descriptionEn?: string;
  storageLimitBytes: string;
  ttsLimitPerPeriod: number;
  convertLimitPerPeriod: number;
  periodType: string;
  price?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
