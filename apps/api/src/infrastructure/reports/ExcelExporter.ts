/**
 * Genera hojas de cálculo Excel (.xlsx) usando ExcelJS, espejo de `export_report`.
 * Dos reportes: ventas e inventario.
 */
import ExcelJS from "exceljs";
import type { InventoryReportRow, SalesReportRow } from "../../domain/reports/Report";

function applyHeaderRow(sheet: ExcelJS.Worksheet, headers: string[]): void {
  const row = sheet.addRow(headers);
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } };
    cell.alignment = { horizontal: "center" };
  });
}

const currency = (n: number) => `$${n.toFixed(2)}`;

/** Reporte de ventas: id, user_id, total, status. */
export async function buildSalesXlsx(rows: SalesReportRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ERP Nexus";
  wb.created = new Date();

  const ws = wb.addWorksheet("Ventas");
  ws.columns = [
    { key: "id",     width: 12 },
    { key: "userId", width: 12 },
    { key: "total",  width: 16 },
    { key: "status", width: 18 },
  ];
  applyHeaderRow(ws, ["ID Venta", "Usuario", "Total", "Estado"]);

  for (const r of rows) {
    ws.addRow([r.id, r.userId ?? "—", r.total == null ? "—" : currency(r.total), r.status ?? "—"]);
  }

  const totalRow = ws.addRow([
    "TOTAL", `${rows.length} ventas`,
    currency(rows.reduce((s, r) => s + (r.total ?? 0), 0)), "",
  ]);
  totalRow.eachCell((c) => { c.font = { bold: true }; });

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** Reporte de inventario: product_id, warehouse_id, quantity. */
export async function buildInventoryXlsx(rows: InventoryReportRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ERP Nexus";
  wb.created = new Date();

  const ws = wb.addWorksheet("Inventario");
  ws.columns = [
    { key: "productId",   width: 14 },
    { key: "warehouseId", width: 14 },
    { key: "quantity",    width: 14 },
  ];
  applyHeaderRow(ws, ["Producto", "Almacén", "Cantidad"]);

  for (const r of rows) {
    ws.addRow([r.productId, r.warehouseId, r.quantity]);
  }

  const totalRow = ws.addRow([
    "TOTAL", `${rows.length} filas`,
    rows.reduce((s, r) => s + r.quantity, 0),
  ]);
  totalRow.eachCell((c) => { c.font = { bold: true }; });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
