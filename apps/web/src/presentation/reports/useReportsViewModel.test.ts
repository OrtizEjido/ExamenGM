import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useReportsViewModel } from "./useReportsViewModel";
import type { AggregateSummary, CategorySummary, SupplierSummary } from "@/domain/reports/Report";

const { mockCat, mockSup, mockAgg, stableServices } = vi.hoisted(() => {
  const mockCat = vi.fn<() => Promise<CategorySummary[]>>();
  const mockSup = vi.fn<() => Promise<SupplierSummary[]>>();
  const mockAgg = vi.fn<() => Promise<AggregateSummary>>();
  const stableServices = {
    getCategorySummary: { execute: mockCat },
    getSupplierSummary: { execute: mockSup },
    getAggregateSummary: { execute: mockAgg },
  };
  return { mockCat, mockSup, mockAgg, stableServices };
});

vi.mock("@/presentation/di/ServicesProvider", () => ({ useServices: () => stableServices }));

const catRows: CategorySummary[] = [{ category: "Alimentos", nSales: 10, gross: 5000 }];
const supRows: SupplierSummary[] = [{ supplier: "Dist MX", nSales: 5, gross: 3000 }];
const agg: AggregateSummary = {
  year: 2025, totalSales: 50, qtyTotal: 226,
  subtotal: 154000, iva: 24640, total: 178640,
};

beforeEach(() => { vi.clearAllMocks(); });

describe("useReportsViewModel", () => {
  it("carga categorías por defecto y pasa a ready", async () => {
    mockCat.mockResolvedValue(catRows);
    const { result } = renderHook(() => useReportsViewModel());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.categoryRows).toHaveLength(1);
    expect(result.current.activeReport).toBe("category");
  });

  it("pasa a error si el repositorio falla", async () => {
    mockCat.mockRejectedValue(new Error("HTTP 503"));
    const { result } = renderHook(() => useReportsViewModel());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("HTTP 503");
  });

  it("cambiar a supplier llama al endpoint correcto", async () => {
    mockCat.mockResolvedValue(catRows);
    mockSup.mockResolvedValue(supRows);
    const { result } = renderHook(() => useReportsViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.setActiveReport("supplier"));
    await waitFor(() => expect(result.current.supplierRows).toHaveLength(1));
    expect(mockSup).toHaveBeenCalledWith(expect.any(Number));
    expect(result.current.supplierRows[0]?.supplier).toBe("Dist MX");
  });

  it("cambiar a aggregate carga el resumen", async () => {
    mockCat.mockResolvedValue(catRows);
    mockAgg.mockResolvedValue(agg);
    const { result } = renderHook(() => useReportsViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.setActiveReport("aggregate"));
    await waitFor(() => expect(result.current.aggregate).not.toBeNull());
    expect(result.current.aggregate?.totalSales).toBe(50);
  });
});
