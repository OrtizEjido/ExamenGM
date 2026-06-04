import type { ReportRepository } from "@/application/reports/ReportRepository";
import type { AggregateSummary, CategorySummary, SupplierSummary } from "@/domain/reports/Report";
import { apiGet } from "../http/apiClient";

export class HttpReportRepository implements ReportRepository {
  async categorySummary(year: number): Promise<CategorySummary[]> {
    return apiGet<CategorySummary[]>(`/api/reports/category?year=${year}`);
  }
  async supplierSummary(year: number): Promise<SupplierSummary[]> {
    return apiGet<SupplierSummary[]>(`/api/reports/supplier?year=${year}`);
  }
  async aggregateSummary(year: number): Promise<AggregateSummary> {
    return apiGet<AggregateSummary>(`/api/reports/aggregate?year=${year}`);
  }
}
