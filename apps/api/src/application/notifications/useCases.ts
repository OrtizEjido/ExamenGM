import type { Notification } from "../../domain/notifications/Notification";
import type {
  CreateNotificationData,
  NotificationRepository,
} from "./NotificationRepository";

export class ListNotifications {
  constructor(private readonly repo: NotificationRepository) {}
  execute(userId: number): Promise<Notification[]> {
    return this.repo.listForUser(userId);
  }
}

export class MarkNotificationRead {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: number): Promise<Notification | null> {
    return this.repo.markRead(id);
  }
}

export class CreateNotification {
  constructor(private readonly repo: NotificationRepository) {}
  execute(input: CreateNotificationData): Promise<Notification> {
    return this.repo.create(input);
  }
}

export class DeleteNotification {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: number): Promise<void> {
    return this.repo.delete(id);
  }
}
