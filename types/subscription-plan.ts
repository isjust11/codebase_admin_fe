export type PlanCode = string;

export interface SubscriptionPlan {
  id: string;
  code: PlanCode;
  name: string;
  description?: string;
  nameEn: string;
  descriptionEn?: string;
  features?: string;
  featuresEn?: string;
  storageLimitBytes: string;
  ttsLimitPerPeriod: number;
  convertLimitPerPeriod: number;
  shareLimitPerPeriod?: number;
  downloadLimitPerPeriod?: number;
  periodType: string;
  price?: number;
  discountPrice?: number;
  isLifetime?: boolean;
  isPopular?: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
