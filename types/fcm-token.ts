export interface FcmToken {
  id?: string;
  token: string;
  userId?: number;
  deviceId?: string;
  platform?: string; // ios | android | web
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

