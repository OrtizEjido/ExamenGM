/** Bounded context: Refunds (reembolsos). */
import type { Id, MoneyString, LegacyDateString, ErrorResponse } from "../common";

/** LEGACY: 5+ variantes equivalentes (Approved / aprobada / done / pending / rejected). */
export type RefundStatus =
  | "pending"
  | "Pending"
  | "pendiente"
  | "Approved"
  | "aprobada"
  | "rejected"
  | "done"
  | (string & {});

// --- Entidad: fila de la tabla `refunds` ---
export interface RefundRow {
  id: Id;
  sale_id: Id | null;
  user_id: Id | null;
  reason: string | null;
  /** LEGACY: TEXT en la BD. */
  amount: MoneyString | null;
  status: RefundStatus | null;
  approved_by: Id | null;
  created_at: LegacyDateString | null;
}

// --- API ---

export interface RefundItemInput {
  product_id: Id;
  qty: number;
}

/** POST /api/refunds (body: sale_id, reason, + items?/user_id). */
export interface CreateRefundRequest {
  sale_id: Id;
  reason: string;
  user_id?: Id;
  items?: RefundItemInput[];
}
export interface CreateRefundResponse {
  refund_id: Id;
  sale_id: Id;
  amount: number;
  status: "pending";
}

/** POST /api/refunds/:rid/approve (body: AdminAuthPayload). */
export interface ApproveRefundResponse {
  refund_id: Id;
  status: "Approved";
  approved_by: Id;
  amount: MoneyString | null;
}
/** Cuando el reembolso ya no está pendiente, el legacy responde con `skipped`. */
export interface SkippedRefundResponse {
  refund_id: Id;
  status: RefundStatus | null;
  skipped: true;
}
export type ApproveRefundResult =
  | ApproveRefundResponse
  | SkippedRefundResponse
  | ErrorResponse;

// GET /api/refunds/search?q       -> RefundRow[]
// GET /api/refunds/by-user/:uid   -> RefundRow[]
