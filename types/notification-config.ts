export interface NotificationConfig {
  id?: string;
  userId?: number;
  key: string;
  value?: string;
  jsonValue?: any;
  isActive: boolean;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

