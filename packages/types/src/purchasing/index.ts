/** Bounded context: Purchasing (compras, líneas y proveedores). */
import type { Id, LegacyDateString } from "../common";

// --- Entidad: fila de la tabla `suppliers` ---
export interface SupplierRow {
  id: Id;
  name: string;
  contact: string | null;
  country: string | null;
}

/** LEGACY: valores observados 'received' | 'reconciled'. */
export type PurchaseStatus = "received" | "reconciled" | (string & {});

// --- Entidad: fila de la tabla `purchases` ---
export interface PurchaseRow {
  id: Id;
  supplier_id: Id | null;
  /** NUMERIC en SQLite. */
  total: number | null;
  received_date: LegacyDateString | null;
  bank_ref: string | null;
  status: PurchaseStatus | null;
}

// --- Entidad: fila de la tabla `purchase_items` ---
export interface PurchaseItemRow {
  id: Id;
  purchase_id: Id;
  product_id: Id;
  qty: number;
  unit_cost: number;
}

// --- API ---

export interface PurchaseItemInput {
  product_id: Id;
  qty: number;
  unit_cost: number;
  warehouse_id?: Id;
}

/** POST /api/purchases */
export interface CreatePurchaseRequest {
  supplier_id: Id;
  items: PurchaseItemInput[];
  /** Debe ser YYYY-MM-DD (validado en el legacy). */
  received_date: string;
}
export interface CreatePurchaseResponse {
  purchase_id: Id;
}

/** POST /api/purchases/:id/reconcile */
export interface ReconcilePurchaseRequest {
  bank_ref: string;
}
export interface ReconcilePurchaseResponse {
  purchase_id: Id;
  bank_ref: string;
}

/** GET /api/purchases (join con suppliers). */
export interface PurchaseListRow {
  id: Id;
  supplier_id: Id | null;
  supplier_name: string | null;
  total: number | null;
  received_date: LegacyDateString | null;
  status: PurchaseStatus | null;
  bank_ref: string | null;
}

// GET /api/suppliers -> SupplierRow[]
