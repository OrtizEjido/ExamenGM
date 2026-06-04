import type { Notification } from "../../domain/notifications/Notification";

export interface CreateNotificationData {
  userId: number;
  message: string;
  kind?: string;
}

/** APLICACIÓN — Puerto del repositorio de notificaciones. */
export interface NotificationRepository {
  listForUser(userId: number): Promise<Notification[]>;
  markRead(id: number): Promise<Notification | null>;
  create(input: CreateNotificationData): Promise<Notification>;
  delete(id: number): Promise<void>;
}
