/**
 * DOMINIO — Reportes exportables. Espejo de `export_report(report_type, filter_clause)`
 * del legacy, con dos tipos: ventas e inventario.
 */

/** Fila del reporte de ventas. `total` (TEXT en legacy) normalizado a número. */
export interface SalesReportRow {
  id: number;
  userId: number | null;
  total: number | null;
  status: string | null;
}

/** Fila del reporte de inventario. */
export interface InventoryReportRow {
  productId: number;
  warehouseId: number;
  quantity: number;
}

export type ReportType = "sales" | "inventory";
