import type { PrismaClient } from "@prisma/client";
import type { AggregateSummary, CategorySummary, SupplierSummary } from "../../domain/reports/Report";
import type { ReportRepository } from "../../application/reports/ReportRepository";

const IVA_RATE = 0.16;

/** INFRAESTRUCTURA — Adapter Prisma del puerto ReportRepository. */
export class PrismaReportRepository implements ReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async categorySummary(year: number): Promise<CategorySummary[]> {
    // Los datos de ventas no están en nuestro esquema Prisma aún (módulo ventas pendiente),
    // pero los productos sí. Usamos rawQuery contra las tablas legacy que ya existen en la BD.
    const rows = await this.prisma.$queryRaw<
      Array<{ category: string | null; n_sales: bigint; gross: number | null }>
    >`
      SELECT p.category, COUNT(si.id) AS n_sales, SUM(si.qty * si.unit_price) AS gross
      FROM sale_items si
      JOIN products p ON p.id = si.product_id
      JOIN sales s ON s.id = si.sale_id
      WHERE p.deleted_at IS NULL
      GROUP BY p.category
      ORDER BY gross DESC
    `;
    return rows.map((r) => ({
      category: r.category,
      nSales: Number(r.n_sales),
      gross: r.gross ?? 0,
    }));
  }

  async supplierSummary(year: number): Promise<SupplierSummary[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{ supplier: string | null; n_sales: bigint; gross: number | null }>
    >`
      SELECT sup.name AS supplier, COUNT(si.id) AS n_sales, SUM(si.qty * si.unit_price) AS gross
      FROM sale_items si
      JOIN products p ON p.id = si.product_id
      JOIN suppliers sup ON sup.id = p.supplier_id
      JOIN sales s ON s.id = si.sale_id
      WHERE p.deleted_at IS NULL
      GROUP BY sup.name
      ORDER BY gross DESC
    `;
    return rows.map((r) => ({
      supplier: r.supplier,
      nSales: Number(r.n_sales),
      gross: r.gross ?? 0,
    }));
  }

  async aggregateSummary(year: number): Promise<AggregateSummary> {
    const rows = await this.prisma.$queryRaw<
      Array<{ qty_total: bigint; subtotal: number | null; n_sales: bigint }>
    >`
      SELECT COUNT(s.id) AS n_sales, SUM(si.qty) AS qty_total,
             SUM(si.qty * si.unit_price) AS subtotal
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
    `;
    const r = rows[0];
    const subtotal = r?.subtotal ?? 0;
    const iva = subtotal * IVA_RATE;
    return {
      year,
      totalSales: Number(r?.n_sales ?? 0),
      qtyTotal: Number(r?.qty_total ?? 0),
      subtotal,
      iva,
      total: subtotal + iva,
    };
  }
}
