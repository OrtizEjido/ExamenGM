/** DOMINIO (frontend) — Notificación. Estatus leído/no leído como booleano. */
export interface Notification {
  id: number;
  userId: number;
  message: string | null;
  kind: string | null;
  read: boolean;
  createdAt: string | null;
}
