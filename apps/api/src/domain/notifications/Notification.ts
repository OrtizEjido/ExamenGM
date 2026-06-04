/** DOMINIO — Notificación. Estatus unificado (code canónico del catálogo). */
export type NotificationStatusCode = "unread" | "read";

export interface Notification {
  id: number;
  userId: number;
  message: string | null;
  kind: string | null;
  status: NotificationStatusCode;
  createdAt: Date | null;
}
