import type {
  InventoryItem as ItemDto, InventoryPage as PageDto, Warehouse as WhDto,
} from "@erp/types";
import type { InventoryRepository, InventoryPage, PageParams } from "@/application/inventory/InventoryRepository";
import type { InventoryItem, Warehouse } from "@/domain/inventory/InventoryItem";
import { apiGet } from "../http/apiClient";

const qs = ({ page, limit }: PageParams) => `page=${page}&limit=${limit}`;

function toItem(d: ItemDto): InventoryItem {
  return {
    productId: d.productId, sku: d.sku, productName: d.productName,
    warehouseId: d.warehouseId, warehouseName: d.warehouseName,
    warehouseRegion: d.warehouseRegion, quantity: d.quantity,
  };
}
function toPage(dto: PageDto): InventoryPage {
  return { items: dto.items.map(toItem), total: dto.total, page: dto.page, limit: dto.limit, pages: dto.pages };
}

export class HttpInventoryRepository implements InventoryRepository {
  async listPaginated(params: PageParams): Promise<InventoryPage> {
    return toPage(await apiGet<PageDto>(`/api/inventory?${qs(params)}`));
  }
  async listByWarehouse(warehouseId: number, params: PageParams): Promise<InventoryPage> {
    return toPage(await apiGet<PageDto>(`/api/inventory/warehouse/${warehouseId}?${qs(params)}`));
  }
  async searchByProductName(query: string, params: PageParams): Promise<InventoryPage> {
    return toPage(await apiGet<PageDto>(`/api/inventory/search/name?q=${encodeURIComponent(query)}&${qs(params)}`));
  }
  async listWarehouses(): Promise<Warehouse[]> {
    const dtos = await apiGet<WhDto[]>("/api/inventory/warehouses");
    return dtos.map((w) => ({ id: w.id, name: w.name, region: w.region }));
  }
}
