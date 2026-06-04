/** DOMINIO — Vista de stock: producto × almacén. */
export interface InventoryItem {
  productId: number;
  sku: string | null;
  productName: string | null;
  warehouseId: number;
  warehouseName: string;
  warehouseRegion: string | null;
  quantity: number;
}

/** DOMINIO — Almacén. */
export interface Warehouse {
  id: number;
  name: string;
  region: string | null;
}
