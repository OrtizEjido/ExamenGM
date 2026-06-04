import type { InventoryItem, Warehouse } from "@/domain/inventory/InventoryItem";

export interface PageParams { page: number; limit: number; }
export interface InventoryPage {
  items: InventoryItem[];
  total: number; page: number; limit: number; pages: number;
}

/** APLICACIÓN — Puerto del repositorio de inventario. */
export interface InventoryRepository {
  listPaginated(params: PageParams): Promise<InventoryPage>;
  listByWarehouse(warehouseId: number, params: PageParams): Promise<InventoryPage>;
  searchByProductName(query: string, params: PageParams): Promise<InventoryPage>;
  listWarehouses(): Promise<Warehouse[]>;
}
