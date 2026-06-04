import type { InventoryItem, Warehouse } from "../../domain/inventory/InventoryItem";

export interface PageParams {
  page: number;
  limit: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** APLICACIÓN — Puerto del repositorio de inventario. */
export interface InventoryRepository {
  /** Lista paginada de todo el stock (join producto + almacén). */
  listPaginated(params: PageParams): Promise<PageResult<InventoryItem>>;
  /** Lista paginada filtrada por almacén. */
  listByWarehouse(warehouseId: number, params: PageParams): Promise<PageResult<InventoryItem>>;
  /** Búsqueda por nombre de producto, paginada. */
  searchByProductName(query: string, params: PageParams): Promise<PageResult<InventoryItem>>;
  /** Todos los almacenes (son solo 3, no necesitan paginado). */
  listWarehouses(): Promise<Warehouse[]>;
}
