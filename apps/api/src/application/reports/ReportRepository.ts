import type { InventoryReportRow, SalesReportRow } from "../../domain/reports/Report";

/**
 * APLICACIÓN — Puerto del repositorio de reportes (solo lectura).
 * `fromId` filtra `id > fromId` (equivalente al `filter_clause` legacy; default 0 = todo).
 */
export interface ReportRepository {
  salesReport(fromId: number): Promise<SalesReportRow[]>;
  inventoryReport(fromId: number): Promise<InventoryReportRow[]>;
}
