import type { Warehouse } from "@/domain/inventory/InventoryItem";
import type { InventoryPage, InventoryRepository, PageParams } from "./InventoryRepository";

export class ListInventory {
  constructor(private readonly repo: InventoryRepository) {}
  execute(params: PageParams): Promise<InventoryPage> { return this.repo.listPaginated(params); }
}
export class ListInventoryByWarehouse {
  constructor(private readonly repo: InventoryRepository) {}
  execute(warehouseId: number, params: PageParams): Promise<InventoryPage> {
    return this.repo.listByWarehouse(warehouseId, params);
  }
}
export class SearchInventoryByProductName {
  constructor(private readonly repo: InventoryRepository) {}
  execute(query: string, params: PageParams): Promise<InventoryPage> {
    return this.repo.searchByProductName(query, params);
  }
}
export class ListWarehouses {
  constructor(private readonly repo: InventoryRepository) {}
  execute(): Promise<Warehouse[]> { return this.repo.listWarehouses(); }
}
