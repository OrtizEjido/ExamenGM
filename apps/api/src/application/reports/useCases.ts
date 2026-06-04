import type { InventoryReportRow, SalesReportRow } from "../../domain/reports/Report";
import type { ReportRepository } from "./ReportRepository";

export class GetSalesReport {
  constructor(private readonly repo: ReportRepository) {}
  execute(fromId = 0): Promise<SalesReportRow[]> { return this.repo.salesReport(fromId); }
}

export class GetInventoryReport {
  constructor(private readonly repo: ReportRepository) {}
  execute(fromId = 0): Promise<InventoryReportRow[]> { return this.repo.inventoryReport(fromId); }
}
