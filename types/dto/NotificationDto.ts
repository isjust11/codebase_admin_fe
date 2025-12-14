import { NotificationType, NotificationPriority, NotificationStatus } from '../notification';

export interface NotificationDto {
  title: string;
  content: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  userId?: number;
  metadata?: any;
}

