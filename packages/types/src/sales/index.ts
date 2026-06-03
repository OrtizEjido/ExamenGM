/** Bounded context: Sales (ventas y sus líneas). */
import type { Id, MoneyString, LegacyDateString } from "../common";

/** LEGACY: valores observados en BD; string libre. */
export type CustomerType = "LEGACY_A" | "NORMAL" | (string & {});

/** LEGACY: 4 variantes equivalentes (idioma + casing). */
export type SaleStatus =
  | "completed"
  | "COMPLETED"
  | "done"
  | "finalizada"
  | (string & {});

// --- Entidad: fila de la tabla `sales` ---
export interface SaleRow {
  id: Id;
  user_id: Id | null;
  /** LEGACY: columna fantasma; la fuente real de líneas es `sale_items`. */
  product_id: Id | null;
  customer_type: CustomerType | null;
  /** REAL. */
  subtotal: number | null;
  /** LEGACY: TEXT en la BD. */
  total: MoneyString | null;
  status: SaleStatus | null;
  last_touch_at: LegacyDateString | null;
  created_at: LegacyDateString | null;
}

// --- Entidad: fila de la tabla `sale_items` ---
export interface SaleItemRow {
  id: Id;
  sale_id: Id;
  product_id: Id;
  qty: number;
  unit_price: number;
}

// --- API ---

export interface SaleItemInput {
  product_id: Id;
  qty: number;
  /** Default 1 en el legacy. */
  warehouse_id?: Id;
}

/** POST /api/sales */
export interface CreateSaleRequest {
  user_id: Id;
  customer_type: CustomerType;
  items: SaleItemInput[];
}
export interface CreateSaleResponse {
  sale_id: Id;
  /** OJO: el backend responde número aquí, aunque lo persiste como string. */
  total: number;
}

export interface ReturnItemInput {
  product_id: Id;
  qty: number;
  warehouse_id?: Id;
}

/** POST /api/sales/:id/return */
export interface ReturnSaleRequest {
  items: ReturnItemInput[];
}
export interface ReturnSaleResponse {
  sale_id: Id;
  returned_items: number;
}

// GET /api/sales/by-user/:uid -> SaleRow[]
