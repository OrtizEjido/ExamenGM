import { describe, it, expect, vi } from "vitest";
import { GetCategorySummary, GetSupplierSummary, GetAggregateSummary } from "./useCases";
import type { ReportRepository } from "./ReportRepository";
import type { AggregateSummary, CategorySummary, SupplierSummary } from "../../domain/reports/Report";

const makeRepo = (): ReportRepository => ({
  categorySummary: vi.fn(),
  supplierSummary: vi.fn(),
  aggregateSummary: vi.fn(),
});

const catRows: CategorySummary[] = [
  { category: "Alimentos", nSales: 10, gross: 5000 },
  { category: "Limpieza", nSales: 5, gross: 2500 },
];
const supRows: SupplierSummary[] = [
  { supplier: "Distribuidora MX", nSales: 12, gross: 8000 },
];
const aggSummary: AggregateSummary = {
  year: 2025, totalSales: 50, qtyTotal: 226,
  subtotal: 154167, iva: 24666, total: 178833,
};

describe("GetCategorySummary", () => {
  it("retorna las filas del repositorio", async () => {
    const repo = makeRepo();
    vi.mocked(repo.categorySummary).mockResolvedValue(catRows);
    const result = await new GetCategorySummary(repo).execute(2025);
    expect(result).toHaveLength(2);
    expect(result[0]?.category).toBe("Alimentos");
    expect(repo.categorySummary).toHaveBeenCalledWith(2025);
  });
});

describe("GetSupplierSummary", () => {
  it("retorna las filas del repositorio", async () => {
    const repo = makeRepo();
    vi.mocked(repo.supplierSummary).mockResolvedValue(supRows);
    const result = await new GetSupplierSummary(repo).execute(2025);
    expect(result[0]?.supplier).toBe("Distribuidora MX");
    expect(repo.supplierSummary).toHaveBeenCalledWith(2025);
  });
});

describe("GetAggregateSummary", () => {
  it("retorna el resumen con los totales", async () => {
    const repo = makeRepo();
    vi.mocked(repo.aggregateSummary).mockResolvedValue(aggSummary);
    const result = await new GetAggregateSummary(repo).execute(2025);
    expect(result.totalSales).toBe(50);
    expect(result.iva).toBeGreaterThan(0);
    expect(repo.aggregateSummary).toHaveBeenCalledWith(2025);
  });
});
