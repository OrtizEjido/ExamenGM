import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCatalogViewModel } from "./useCatalogViewModel";
import type { Product } from "@/domain/catalog/Product";

/**
 * La referencia al servicio DEBE ser estable entre renders (igual que hace
 * ServicesProvider real con useRef). Si se devuelve un objeto nuevo en cada
 * llamada a useServices(), useCallback([listProducts]) se recrea en cada render
 * y el efecto entra en bucle infinito reponiendo el estado a "loading".
 */
const { mockExecute, stableServices } = vi.hoisted(() => {
  const mockExecute = vi.fn<() => Promise<Product[]>>();
  const stableServices = { listProducts: { execute: mockExecute } };
  return { mockExecute, stableServices };
});

vi.mock("@/presentation/di/ServicesProvider", () => ({
  useServices: () => stableServices,
}));

const makeProduct = (overrides?: Partial<Product>): Product => ({
  id: 1,
  sku: "SKU-00001",
  name: "Producto Demo",
  description: null,
  price: 100,
  category: "Limpieza",
  supplierId: 1,
  createdAt: "2025-01-15T00:00:00.000Z",
  updatedAt: "2025-01-15T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useCatalogViewModel", () => {
  it("inicia en loading y termina en ready con los productos", async () => {
    const products = [makeProduct(), makeProduct({ id: 2, sku: "SKU-00002" })];
    mockExecute.mockResolvedValue(products);

    const { result } = renderHook(() => useCatalogViewModel());

    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.products).toHaveLength(2);
  });

  it("pasa a error si el repositorio falla", async () => {
    mockExecute.mockRejectedValue(new Error("HTTP 500"));

    const { result } = renderHook(() => useCatalogViewModel());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("HTTP 500");
  });

  it("filtra por nombre al escribir en nameQuery", async () => {
    mockExecute.mockResolvedValue([
      makeProduct({ id: 1, name: "Café Especial" }),
      makeProduct({ id: 2, name: "Jabón Líquido" }),
    ]);

    const { result } = renderHook(() => useCatalogViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.setNameQuery("café"));

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].name).toBe("Café Especial");
  });

  it("busca por SKU con padding de ceros (14 → 00014)", async () => {
    mockExecute.mockResolvedValue([
      makeProduct({ id: 14, sku: "SKU-00014", name: "Catorce" }),
      makeProduct({ id: 20, sku: "SKU-00020", name: "Veinte" }),
    ]);

    const { result } = renderHook(() => useCatalogViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.setSkuQuery("14"));

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].sku).toBe("SKU-00014");
  });

  it("reload vuelve a llamar al repositorio", async () => {
    mockExecute.mockResolvedValue([makeProduct()]);

    const { result } = renderHook(() => useCatalogViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.reload());
    await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(2));
  });
});
