export enum NotificationType {
  System = 1,
  ContractCreated = 2,
  ContractExpiring = 3,
  Reminder = 4,
}

export enum NotificationPriority {
  Info = 1,
  Warning = 2,
  Critical = 3,
}

export enum NotificationStatus {
  Unread = 1,
  Read = 2,
  Archived = 3,
}

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  recipientUserId: number;
  actionRoute?: string | null;
  createdAt: string;
  readAt?: string | null;
  expiresAt?: string | null;
}

export type NotificationPayload = NotificationDto;
