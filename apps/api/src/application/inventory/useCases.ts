import type { InventoryItem, Warehouse } from "../../domain/inventory/InventoryItem";
import type {
  InventoryRepository,
  PageParams,
  PageResult,
} from "./InventoryRepository";

export class ListInventory {
  constructor(private readonly repo: InventoryRepository) {}
  execute(params: PageParams): Promise<PageResult<InventoryItem>> {
    return this.repo.listPaginated(params);
  }
}

export class ListInventoryByWarehouse {
  constructor(private readonly repo: InventoryRepository) {}
  execute(warehouseId: number, params: PageParams): Promise<PageResult<InventoryItem>> {
    return this.repo.listByWarehouse(warehouseId, params);
  }
}

export class SearchInventoryByProductName {
  constructor(private readonly repo: InventoryRepository) {}
  execute(query: string, params: PageParams): Promise<PageResult<InventoryItem>> {
    return this.repo.searchByProductName(query, params);
  }
}

export class ListWarehouses {
  constructor(private readonly repo: InventoryRepository) {}
  execute(): Promise<Warehouse[]> {
    return this.repo.listWarehouses();
  }
}
