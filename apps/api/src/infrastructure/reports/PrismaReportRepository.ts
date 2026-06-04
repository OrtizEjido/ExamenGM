import type { PrismaClient } from "@prisma/client";
import type { InventoryReportRow, SalesReportRow } from "../../domain/reports/Report";
import type { ReportRepository } from "../../application/reports/ReportRepository";

/** INFRAESTRUCTURA — Adapter Prisma del puerto ReportRepository.
 *  Espejo de `export_report`: filtra `id > fromId` (default 0 = todas las filas).
 */
export class PrismaReportRepository implements ReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // report_type = 'sales' → SELECT id, user_id, total, status FROM sales WHERE id > ?
  async salesReport(fromId: number): Promise<SalesReportRow[]> {
    const rows = await this.prisma.sale.findMany({
      where: { id: { gt: fromId } },
      orderBy: { id: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      total: r.total == null ? null : Number(r.total), // TEXT → número
      status: r.status,
    }));
  }

  // report_type = 'inventory' → SELECT product_id, warehouse_id, quantity FROM inventory_stock WHERE product_id > ?
  async inventoryReport(fromId: number): Promise<InventoryReportRow[]> {
    const rows = await this.prisma.inventoryStock.findMany({
      where: { productId: { gt: fromId } },
      orderBy: [{ productId: "asc" }, { warehouseId: "asc" }],
    });
    return rows.map((r) => ({
      productId: r.productId,
      warehouseId: r.warehouseId,
      quantity: r.quantity,
    }));
  }
}
