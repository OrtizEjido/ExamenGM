import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useInventoryViewModel } from "./useInventoryViewModel";
import type { InventoryItem, Warehouse } from "@/domain/inventory/InventoryItem";
import type { InventoryPage } from "@/application/inventory/InventoryRepository";

const { mockList, mockByWarehouse, mockSearch, mockWarehouses, stableServices } = vi.hoisted(() => {
  const mockList       = vi.fn<() => Promise<InventoryPage>>();
  const mockByWarehouse = vi.fn<() => Promise<InventoryPage>>();
  const mockSearch     = vi.fn<() => Promise<InventoryPage>>();
  const mockWarehouses = vi.fn<() => Promise<Warehouse[]>>();
  const stableServices = {
    listInventory:                { execute: mockList },
    listInventoryByWarehouse:     { execute: mockByWarehouse },
    searchInventoryByProductName: { execute: mockSearch },
    listWarehouses:               { execute: mockWarehouses },
  };
  return { mockList, mockByWarehouse, mockSearch, mockWarehouses, stableServices };
});

vi.mock("@/presentation/di/ServicesProvider", () => ({ useServices: () => stableServices }));

const makeItem = (o?: Partial<InventoryItem>): InventoryItem => ({
  productId: 1, sku: "SKU-00001", productName: "Prod Demo",
  warehouseId: 1, warehouseName: "Centro", warehouseRegion: "CDMX", quantity: 50, ...o,
});
const makePage = (items: InventoryItem[]): InventoryPage => ({
  items, total: items.length, page: 1, limit: 20, pages: 1,
});
const whs: Warehouse[] = [{ id: 1, name: "Centro", region: "CDMX" }];

beforeEach(() => { vi.clearAllMocks(); });

describe("useInventoryViewModel", () => {
  it("inicia en loading y carga la primera página", async () => {
    mockList.mockResolvedValue(makePage([makeItem()]));
    mockWarehouses.mockResolvedValue(whs);
    const { result } = renderHook(() => useInventoryViewModel());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.warehouses).toHaveLength(1);
  });

  it("pasa a error si el repositorio falla", async () => {
    mockList.mockRejectedValue(new Error("HTTP 503"));
    mockWarehouses.mockResolvedValue([]);
    const { result } = renderHook(() => useInventoryViewModel());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("HTTP 503");
  });

  it("filterByWarehouse llama al endpoint de almacén", async () => {
    mockList.mockResolvedValue(makePage([makeItem()]));
    mockWarehouses.mockResolvedValue(whs);
    mockByWarehouse.mockResolvedValue(makePage([makeItem({ warehouseId: 2, warehouseName: "Norte" })]));
    const { result } = renderHook(() => useInventoryViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    act(() => result.current.filterByWarehouse(2));
    await waitFor(() => expect(result.current.searchMode).toBe("warehouse"));
    expect(result.current.items[0]?.warehouseId).toBe(2);
    expect(mockByWarehouse).toHaveBeenCalledWith(2, { page: 1, limit: 20 });
  });

  it("searchByName llama al endpoint de búsqueda", async () => {
    mockList.mockResolvedValue(makePage([makeItem()]));
    mockWarehouses.mockResolvedValue(whs);
    mockSearch.mockResolvedValue(makePage([makeItem({ productName: "Café" })]));
    const { result } = renderHook(() => useInventoryViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    act(() => result.current.setNameQuery("Café"));
    act(() => result.current.searchByName());
    await waitFor(() => expect(result.current.searchMode).toBe("name"));
    expect(result.current.items[0]?.productName).toBe("Café");
    expect(mockSearch).toHaveBeenCalledWith("Café", { page: 1, limit: 20 });
  });

  it("clearSearch vuelve al modo all", async () => {
    mockList.mockResolvedValue(makePage([makeItem()]));
    mockWarehouses.mockResolvedValue(whs);
    mockByWarehouse.mockResolvedValue(makePage([makeItem({ warehouseId: 2 })]));
    const { result } = renderHook(() => useInventoryViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    act(() => result.current.filterByWarehouse(2));
    await waitFor(() => expect(result.current.searchMode).toBe("warehouse"));
    act(() => result.current.clearSearch());
    await waitFor(() => expect(result.current.searchMode).toBe("all"));
    expect(mockList).toHaveBeenCalledTimes(2);
  });
});
