import type { Notification } from "@/domain/notifications/Notification";
import type { NotificationsRepository } from "./NotificationsRepository";

export class ListNotifications {
  constructor(private readonly repository: NotificationsRepository) {}
  execute(userId: number): Promise<Notification[]> {
    return this.repository.listForUser(userId);
  }
}

export class MarkNotificationRead {
  constructor(private readonly repository: NotificationsRepository) {}
  execute(id: number): Promise<Notification> {
    return this.repository.markRead(id);
  }
}
