/** Bounded context: Notifications. */
import type { Id, LegacyDateString } from "../common";

/** LEGACY: VALID_KINDS en notifications.py. */
export type NotificationKind =
  | "info"
  | "warn"
  | "alert"
  | "system"
  | "marketing";

/** LEGACY: variantes equivalentes (read / READ / leido / unread). */
export type NotificationStatus =
  | "unread"
  | "read"
  | "READ"
  | "leido"
  | (string & {});

// --- Entidad: fila de la tabla `notifications` ---
export interface NotificationRow {
  id: Id;
  user_id: Id | null;
  message: string | null;
  kind: NotificationKind | string | null;
  status: NotificationStatus | null;
  created_at: LegacyDateString | null;
}

// --- API ---

// GET /api/notifications/:uid -> NotificationRow[]

/** POST /api/notifications/:nid/read */
export interface MarkNotificationReadResponse {
  id: Id;
  status: "read";
}

/** POST /api/notifications */
export interface CreateNotificationRequest {
  user_id: Id;
  message: string;
  /** Si no es un kind válido, el legacy lo fuerza a 'info'. */
  kind?: NotificationKind | string;
}
export interface CreateNotificationResponse {
  id: Id;
  user_id: Id;
  created_at: LegacyDateString;
}

/** POST /api/notifications/broadcast (incluye AdminAuthPayload). */
export interface BroadcastNotificationRequest {
  message: string;
  kind?: NotificationKind | string;
  is_admin?: boolean;
  user_id?: Id;
}
export interface BroadcastNotificationResponse {
  broadcast: boolean;
  delivered: number;
}

/** DELETE /api/notifications/:nid */
export interface DeleteNotificationResponse {
  id: Id;
  deleted: boolean;
}

// ---------------------------------------------------------------------------
// Contrato NORMALIZADO (API nueva, apps/api). El estatus leído/no leído es binario,
// así que se modela como booleano `read` (en BD se almacena 0/1). La etiqueta visible
// ("Leída"/"No leída" · "Read"/"Unread") se resuelve por idioma en el frontend (i18n).
// ---------------------------------------------------------------------------

export interface Notification {
  id: Id;
  userId: Id;
  message: string | null;
  kind: string | null;
  /** true = leída, false = no leída. */
  read: boolean;
  /** ISO 8601 o null. */
  createdAt: string | null;
}

export interface CreateNotificationInput {
  userId: Id;
  message: string;
  kind?: string;
}
