import { PlanCode } from '../subscription-plan';

export interface CreateSubscriptionPlanDto {
  code: PlanCode;
  name: string;
  description?: string;
  nameEn: string;
  descriptionEn?: string;
  features?: string;
  featuresEn?: string;
  storageLimitBytes?: number;
  ttsLimitPerPeriod?: number;
  convertLimitPerPeriod?: number;
  shareLimitPerPeriod?: number;
  downloadLimitPerPeriod?: number;
  periodType?: string;
  price?: number;
  discountPrice?: number;
  isLifetime?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  nameEn?: string;
  descriptionEn?: string;
  features?: string;
  featuresEn?: string;
  storageLimitBytes?: number;
  ttsLimitPerPeriod?: number;
  convertLimitPerPeriod?: number;
  shareLimitPerPeriod?: number;
  downloadLimitPerPeriod?: number;
  periodType?: string;
  price?: number;
  discountPrice?: number;
  isLifetime?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}
