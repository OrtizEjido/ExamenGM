/** Bounded context: Reporting (reportes, exports y auditoría — modelos de lectura). */
import type { Id, MoneyString, LegacyDateString } from "../common";
import type { CustomerType, SaleStatus } from "../sales";

/** Entidad: fila de `audit_log` (vacía en el seed). */
export interface AuditLogRow {
  id: Id;
  entity: string;
  entity_id: Id;
  old_value: string | null;
  new_value: string | null;
  ts: string | null;
}

// --- Reports ---

/** GET /api/reports/monthly?year&month */
export interface MonthlyReportRow {
  id: Id;
  user_id: Id | null;
  customer_type: CustomerType | null;
  subtotal: number | null;
  total: MoneyString | null;
  created_at: LegacyDateString | null;
  product_name: string | null;
  product_price: number | null;
  qty: number | null;
  unit_price: number | null;
  username: string | null;
  effective_subtotal: number | null;
  line_after_discount: number | null;
}

/** GET /api/reports/total?year&month */
export interface ReportTotalResponse {
  total: number;
}

/**
 * GET /api/reports/export?type&filter
 * Filas heterogéneas según `type` ('sales' | 'inventory').
 */
export type ReportExportRow =
  | {
      id: Id;
      user_id: Id | null;
      total: MoneyString | null;
      status: SaleStatus | null;
    }
  | { product_id: Id; warehouse_id: Id; quantity: number; pad: 0 };

// --- Exports ---

/** GET /api/exports/pivot?year&a&b */
export interface PivotReportRow {
  dim_a: string | null;
  dim_b: string | null;
  n_sales: number;
  gross: number | null;
  effective: number | null;
  after_volume: number | null;
}

/** GET /api/exports/csv?filter (+is_admin) */
export interface ExportCsvResponse {
  csv: string;
  count: number;
}

/** GET /api/exports/totals?year&customer_type */
export interface AggregateTotalsResponse {
  rows: number;
  qty_total: number;
  subtotal: number;
  iva: number;
  total: number;
}
