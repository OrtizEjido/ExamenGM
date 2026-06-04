/** DOMINIO (frontend) — Notificación. Estatus unificado (code canónico). */
export type NotificationStatusCode = "unread" | "read";

export interface Notification {
  id: number;
  userId: number;
  message: string | null;
  kind: string | null;
  status: NotificationStatusCode;
  createdAt: string | null;
}
