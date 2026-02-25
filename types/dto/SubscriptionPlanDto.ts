import { PlanCode } from '../subscription-plan';

export interface CreateSubscriptionPlanDto {
  code: PlanCode;
  name: string;
  description?: string;
  storageLimitBytes?: number;
  ttsLimitPerPeriod?: number;
  convertLimitPerPeriod?: number;
  periodType?: string;
  price?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  storageLimitBytes?: number;
  ttsLimitPerPeriod?: number;
  convertLimitPerPeriod?: number;
  periodType?: string;
  price?: number;
  sortOrder?: number;
  isActive?: boolean;
}
