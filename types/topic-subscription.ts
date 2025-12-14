export interface TopicSubscription {
  id?: string;
  userId: number;
  topic: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

