/** Bounded context: Inventory (almacenes / stock / movimientos). */
import type { Id } from "../common";

// --- Entidad: fila de la tabla `warehouses` ---
export interface WarehouseRow {
  id: Id;
  name: string;
  region: string | null;
}

// --- Entidad: fila de la tabla `inventory_stock` (sin PK declarada) ---
export interface InventoryStockRow {
  product_id: Id;
  warehouse_id: Id;
  quantity: number;
}

/** Entidad: fila de `inventory_movements` (tabla vacía en el seed; feature sin uso). */
export interface InventoryMovementRow {
  id: Id;
  product_id: Id;
  warehouse_id: Id;
  qty: number;
  type: string;
  ref_id: Id | null;
  ts: string | null;
}

// --- API ---

/** GET /api/inventory (join products + inventory_stock + warehouses). */
export interface InventoryOverviewRow {
  /** id del producto. */
  id: Id;
  name: string | null;
  sku: string | null;
  /** nombre del almacén. */
  warehouse: string | null;
  quantity: number | null;
}

// GET /api/inventory/warehouse/:wh -> InventoryStockRow[]
