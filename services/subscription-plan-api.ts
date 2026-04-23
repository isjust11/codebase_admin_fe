import { axiosInstance } from "@/lib/axios";
import { SubscriptionPlan } from "@/types/subscription-plan";
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from "@/types/dto/SubscriptionPlanDto";

export const getSubscriptionPlans = async (activeOnly = false): Promise<SubscriptionPlan[]> => {
  const response = await axiosInstance.get('/subscription-plans', {
    params: activeOnly ? { activeOnly: 'true' } : {},
  });
  return response.data;
};

export const getSubscriptionPlanById = async (id: string): Promise<SubscriptionPlan> => {
  const response = await axiosInstance.get(`/subscription-plans/${id}`);
  return response.data;
};

export const createSubscriptionPlan = async (data: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> => {
  const response = await axiosInstance.post('/subscription-plans', data);
  return response.data;
};

export const updateSubscriptionPlan = async (id: string, data: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> => {
  const response = await axiosInstance.put(`/subscription-plans/${id}`, data);
  return response.data;
};

export const deleteSubscriptionPlan = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/subscription-plans/${id}`);
};

export const getSubscriptionPlansMetadata = async (): Promise<{ codes: string[]; periodTypes: string[] }> => {
  const response = await axiosInstance.get('/subscription-plans/metadata/enums');
  return response.data;
};
