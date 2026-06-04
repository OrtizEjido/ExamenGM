/**
 * Genera hojas de cálculo Excel (.xlsx) usando ExcelJS.
 * Cada tipo de reporte produce un workbook listo para descargar.
 */
import ExcelJS from "exceljs";
import type { AggregateSummary, CategorySummary, SupplierSummary } from "../../domain/reports/Report";

// ── helpers ─────────────────────────────────────────────────────────────────

function applyHeaderRow(sheet: ExcelJS.Worksheet, headers: string[]): void {
  const row = sheet.addRow(headers);
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E79" } };
    cell.alignment = { horizontal: "center" };
  });
}

function currency(n: number): string {
  return `$${n.toFixed(2)}`;
}

// ── exporters ────────────────────────────────────────────────────────────────

export async function buildCategoryXlsx(rows: CategorySummary[], year: number): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ERP Nexus";
  wb.created = new Date();

  const ws = wb.addWorksheet(`Ventas por Categoría ${year}`);
  ws.columns = [
    { header: "", key: "category", width: 28 },
    { header: "", key: "nSales",   width: 14 },
    { header: "", key: "gross",    width: 18 },
  ];

  applyHeaderRow(ws, ["Categoría", "Nº Ventas", "Monto Bruto"]);

  for (const r of rows) {
    ws.addRow([r.category ?? "Sin categoría", r.nSales, currency(r.gross)]);
  }

  // Totales
  const totalRow = ws.addRow([
    "TOTAL",
    rows.reduce((s, r) => s + r.nSales, 0),
    currency(rows.reduce((s, r) => s + r.gross, 0)),
  ]);
  totalRow.eachCell((c) => { c.font = { bold: true }; });

  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function buildSupplierXlsx(rows: SupplierSummary[], year: number): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ERP Nexus";

  const ws = wb.addWorksheet(`Ventas por Proveedor ${year}`);
  ws.columns = [
    { header: "", key: "supplier", width: 28 },
    { header: "", key: "nSales",   width: 14 },
    { header: "", key: "gross",    width: 18 },
  ];

  applyHeaderRow(ws, ["Proveedor", "Nº Ventas", "Monto Bruto"]);

  for (const r of rows) {
    ws.addRow([r.supplier ?? "Sin proveedor", r.nSales, currency(r.gross)]);
  }

  const totalRow = ws.addRow([
    "TOTAL",
    rows.reduce((s, r) => s + r.nSales, 0),
    currency(rows.reduce((s, r) => s + r.gross, 0)),
  ]);
  totalRow.eachCell((c) => { c.font = { bold: true }; });

  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function buildAggregateXlsx(summary: AggregateSummary): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ERP Nexus";

  const ws = wb.addWorksheet(`Resumen ${summary.year}`);
  ws.columns = [
    { header: "", key: "label", width: 24 },
    { header: "", key: "value", width: 20 },
  ];

  applyHeaderRow(ws, ["Concepto", "Valor"]);

  const rows: [string, string | number][] = [
    ["Año", summary.year],
    ["Total de ventas", summary.totalSales],
    ["Unidades vendidas", summary.qtyTotal],
    ["Subtotal", currency(summary.subtotal)],
    ["IVA (16%)", currency(summary.iva)],
    ["Total", currency(summary.total)],
  ];

  for (const [label, value] of rows) {
    ws.addRow([label, value]);
  }

  // Resaltar fila de total
  const lastRow = ws.lastRow;
  if (lastRow) lastRow.eachCell((c) => { c.font = { bold: true }; });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
