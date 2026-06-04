/** DOMINIO — Notificación. Estatus leído/no leído como booleano (binario). */
export interface Notification {
  id: number;
  userId: number;
  message: string | null;
  kind: string | null;
  read: boolean;
  createdAt: Date | null;
}
