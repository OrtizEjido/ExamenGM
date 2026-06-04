import type { Notification as NotificationDto } from "@erp/types";
import type { NotificationsRepository } from "@/application/notifications/NotificationsRepository";
import type { Notification } from "@/domain/notifications/Notification";
import { apiGet, apiPost } from "../http/apiClient";

function toDomain(d: NotificationDto): Notification {
  return {
    id: d.id,
    userId: d.userId,
    message: d.message,
    kind: d.kind,
    read: d.read,
    createdAt: d.createdAt,
  };
}

/** INFRAESTRUCTURA — Adapter HTTP del puerto de notificaciones (consume apps/api). */
export class HttpNotificationsRepository implements NotificationsRepository {
  async listForUser(userId: number): Promise<Notification[]> {
    const dtos = await apiGet<NotificationDto[]>(`/api/notifications/${userId}`);
    return dtos.map(toDomain);
  }

  async markRead(id: number): Promise<Notification> {
    const dto = await apiPost<NotificationDto>(`/api/notifications/${id}/read`);
    return toDomain(dto);
  }
}
