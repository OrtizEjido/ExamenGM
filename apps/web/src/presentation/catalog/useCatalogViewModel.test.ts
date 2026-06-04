import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCatalogViewModel } from "./useCatalogViewModel";
import type { ProductPage } from "@/application/catalog/CatalogRepository";

const { mockList, mockSearchName, mockSearchSku, stableServices } = vi.hoisted(() => {
  const mockList       = vi.fn<() => Promise<ProductPage>>();
  const mockSearchName = vi.fn<() => Promise<ProductPage>>();
  const mockSearchSku  = vi.fn<() => Promise<ProductPage>>();
  const stableServices = {
    listProducts:         { execute: mockList },
    searchProductsByName: { execute: mockSearchName },
    searchProductsBySku:  { execute: mockSearchSku },
  };
  return { mockList, mockSearchName, mockSearchSku, stableServices };
});

vi.mock("@/presentation/di/ServicesProvider", () => ({
  useServices: () => stableServices,
}));

const makePage = (items: { id: number; name?: string; sku?: string }[]): ProductPage => ({
  items: items.map((i) => ({
    id: i.id, sku: i.sku ?? `SKU-${String(i.id).padStart(5, "0")}`,
    name: i.name ?? `Producto ${i.id}`, description: null, price: 100,
    category: "Test", supplierId: 1,
    createdAt: null, updatedAt: null, deletedAt: null,
  })),
  total: items.length, page: 1, limit: 20, pages: 1,
});

beforeEach(() => { vi.clearAllMocks(); });

describe("useCatalogViewModel", () => {
  it("inicia en loading y carga la primera página", async () => {
    mockList.mockResolvedValue(makePage([{ id: 1 }, { id: 2 }]));
    const { result } = renderHook(() => useCatalogViewModel());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.products).toHaveLength(2);
    expect(result.current.searchMode).toBe("list");
  });

  it("pasa a error si el repositorio falla", async () => {
    mockList.mockRejectedValue(new Error("HTTP 500"));
    const { result } = renderHook(() => useCatalogViewModel());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("HTTP 500");
  });

  it("searchByName llama al endpoint de nombre con el query del input", async () => {
    mockList.mockResolvedValue(makePage([{ id: 1 }]));
    mockSearchName.mockResolvedValue(makePage([{ id: 5, name: "Café Especial" }]));

    const { result } = renderHook(() => useCatalogViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.setNameQuery("café"));
    act(() => result.current.searchByName());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    expect(result.current.searchMode).toBe("name");
    expect(result.current.products[0]?.name).toBe("Café Especial");
    expect(mockSearchName).toHaveBeenCalledWith("café", { page: 1, limit: 20 });
  });

  it("searchBySku llama al endpoint de SKU (el API hace el padding)", async () => {
    mockList.mockResolvedValue(makePage([{ id: 1 }]));
    mockSearchSku.mockResolvedValue(makePage([{ id: 14, sku: "SKU-00014" }]));

    const { result } = renderHook(() => useCatalogViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.setSkuQuery("14"));
    act(() => result.current.searchBySku());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    expect(result.current.searchMode).toBe("sku");
    expect(result.current.products[0]?.sku).toBe("SKU-00014");
    expect(mockSearchSku).toHaveBeenCalledWith("14", { page: 1, limit: 20 });
  });

  it("clearSearch vuelve al modo list y recarga la página 1", async () => {
    mockList.mockResolvedValue(makePage([{ id: 1 }]));
    mockSearchName.mockResolvedValue(makePage([{ id: 5, name: "Café" }]));

    const { result } = renderHook(() => useCatalogViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.setNameQuery("café"));
    act(() => result.current.searchByName());
    await waitFor(() => expect(result.current.searchMode).toBe("name"));

    act(() => result.current.clearSearch());
    await waitFor(() => expect(result.current.searchMode).toBe("list"));
    expect(mockList).toHaveBeenCalledTimes(2);
  });
});
