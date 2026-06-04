import { describe, it, expect, vi } from "vitest";
import {
  ListInventory, ListInventoryByWarehouse,
  SearchInventoryByProductName, ListWarehouses,
} from "./useCases";
import type { InventoryRepository, PageParams, PageResult } from "./InventoryRepository";
import type { InventoryItem, Warehouse } from "../../domain/inventory/InventoryItem";

const PAGE: PageParams = { page: 1, limit: 20 };

const makeItem = (o?: Partial<InventoryItem>): InventoryItem => ({
  productId: 1, sku: "SKU-00001", productName: "Producto Demo",
  warehouseId: 1, warehouseName: "Centro", warehouseRegion: "CDMX", quantity: 50,
  ...o,
});
const makePage = (items: InventoryItem[]): PageResult<InventoryItem> => ({
  items, total: items.length, page: 1, limit: 20, pages: 1,
});

const makeRepo = (): InventoryRepository => ({
  listPaginated: vi.fn(),
  listByWarehouse: vi.fn(),
  searchByProductName: vi.fn(),
  listWarehouses: vi.fn(),
});

describe("ListInventory", () => {
  it("devuelve la página completa del repositorio", async () => {
    const repo = makeRepo();
    vi.mocked(repo.listPaginated).mockResolvedValue(makePage([makeItem()]));
    const result = await new ListInventory(repo).execute(PAGE);
    expect(result.items).toHaveLength(1);
    expect(repo.listPaginated).toHaveBeenCalledWith(PAGE);
  });
});

describe("ListInventoryByWarehouse", () => {
  it("delega con el warehouseId correcto", async () => {
    const repo = makeRepo();
    vi.mocked(repo.listByWarehouse).mockResolvedValue(makePage([makeItem({ warehouseId: 2 })]));
    const result = await new ListInventoryByWarehouse(repo).execute(2, PAGE);
    expect(result.items[0]?.warehouseId).toBe(2);
    expect(repo.listByWarehouse).toHaveBeenCalledWith(2, PAGE);
  });
});

describe("SearchInventoryByProductName", () => {
  it("delega la búsqueda por nombre", async () => {
    const repo = makeRepo();
    vi.mocked(repo.searchByProductName).mockResolvedValue(makePage([makeItem({ productName: "Café" })]));
    const result = await new SearchInventoryByProductName(repo).execute("Café", PAGE);
    expect(result.items[0]?.productName).toBe("Café");
    expect(repo.searchByProductName).toHaveBeenCalledWith("Café", PAGE);
  });
});

describe("ListWarehouses", () => {
  it("retorna la lista de almacenes", async () => {
    const repo = makeRepo();
    const whs: Warehouse[] = [
      { id: 1, name: "Centro", region: "CDMX" },
      { id: 2, name: "Norte", region: "Monterrey" },
    ];
    vi.mocked(repo.listWarehouses).mockResolvedValue(whs);
    const result = await new ListWarehouses(repo).execute();
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe("Centro");
  });
});
