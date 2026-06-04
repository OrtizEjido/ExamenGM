import { Router } from "express";
import type { AppServices } from "../../infrastructure/di/container";
import { asyncHandler } from "./asyncHandler";
import { buildSalesXlsx, buildInventoryXlsx } from "../../infrastructure/reports/ExcelExporter";

/** `from` = filtro `id > from` (equivalente al filter_clause legacy; default 0 = todo). */
function parseFrom(raw: unknown): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

export function createReportRouter(services: AppServices): Router {
  const router = Router();

  // GET /api/reports/sales?from=0  — datos JSON
  router.get("/sales", asyncHandler(async (req, res) => {
    const rows = await services.getSalesReport.execute(parseFrom(req.query.from));
    res.json(rows);
  }));

  // GET /api/reports/inventory?from=0  — datos JSON
  router.get("/inventory", asyncHandler(async (req, res) => {
    const rows = await services.getInventoryReport.execute(parseFrom(req.query.from));
    res.json(rows);
  }));

  // GET /api/reports/export/xlsx?type=sales|inventory&from=0  — descarga Excel
  router.get("/export/xlsx", asyncHandler(async (req, res) => {
    const from = parseFrom(req.query.from);
    const type = typeof req.query.type === "string" ? req.query.type : "sales";

    let buffer: Buffer;
    let filename: string;

    if (type === "inventory") {
      buffer = await buildInventoryXlsx(await services.getInventoryReport.execute(from));
      filename = "reporte-inventario.xlsx";
    } else {
      buffer = await buildSalesXlsx(await services.getSalesReport.execute(from));
      filename = "reporte-ventas.xlsx";
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  }));

  return router;
}
