import type { AggregateSummary, CategorySummary, SupplierSummary } from "../../domain/reports/Report";
import type { ReportRepository } from "./ReportRepository";

export class GetCategorySummary {
  constructor(private readonly repo: ReportRepository) {}
  execute(year: number): Promise<CategorySummary[]> { return this.repo.categorySummary(year); }
}

export class GetSupplierSummary {
  constructor(private readonly repo: ReportRepository) {}
  execute(year: number): Promise<SupplierSummary[]> { return this.repo.supplierSummary(year); }
}

export class GetAggregateSummary {
  constructor(private readonly repo: ReportRepository) {}
  execute(year: number): Promise<AggregateSummary> { return this.repo.aggregateSummary(year); }
}
