import type { AggregateSummary, CategorySummary, SupplierSummary } from "@/domain/reports/Report";

export interface ReportRepository {
  categorySummary(year: number): Promise<CategorySummary[]>;
  supplierSummary(year: number): Promise<SupplierSummary[]>;
  aggregateSummary(year: number): Promise<AggregateSummary>;
}
