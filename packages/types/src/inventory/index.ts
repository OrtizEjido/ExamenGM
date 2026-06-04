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

// ---------------------------------------------------------------------------
// Contrato NORMALIZADO (API nueva, apps/api). camelCase, FK como id numérico.
// ---------------------------------------------------------------------------

export interface Warehouse {
  id: Id;
  name: string;
  region: string | null;
}

/** Vista de inventario: stock de un producto en un almacén (join de 3 tablas). */
export interface InventoryItem {
  productId: Id;
  sku: string | null;
  productName: string | null;
  warehouseId: Id;
  warehouseName: string;
  warehouseRegion: string | null;
  quantity: number;
}

/** Respuesta paginada del inventario. */
export interface InventoryPage {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
