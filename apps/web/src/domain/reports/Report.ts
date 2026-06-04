export interface CategorySummary { category: string | null; nSales: number; gross: number; }
export interface SupplierSummary { supplier: string | null; nSales: number; gross: number; }
export interface AggregateSummary {
  year: number; totalSales: number; qtyTotal: number;
  subtotal: number; iva: number; total: number;
}
export type ReportType = "category" | "supplier" | "aggregate";
