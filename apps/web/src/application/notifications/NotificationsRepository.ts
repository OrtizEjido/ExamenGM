import type { Notification } from "@/domain/notifications/Notification";

/** APLICACIÓN — Puerto del catálogo de notificaciones. */
export interface NotificationsRepository {
  listForUser(userId: number): Promise<Notification[]>;
  markRead(id: number): Promise<Notification>;
}
