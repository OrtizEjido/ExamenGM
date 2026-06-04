import { Router } from "express";
import type { AppServices } from "../../infrastructure/di/container";
import { asyncHandler } from "./asyncHandler";
import {
  buildCategoryXlsx,
  buildSupplierXlsx,
  buildAggregateXlsx,
} from "../../infrastructure/reports/ExcelExporter";

const CURRENT_YEAR = new Date().getFullYear();

function parseYear(raw: unknown): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 2000 && n <= 2100 ? n : CURRENT_YEAR;
}

export function createReportRouter(services: AppServices): Router {
  const router = Router();

  // GET /api/reports/category?year=2025  — datos JSON
  router.get("/category", asyncHandler(async (req, res) => {
    const year = parseYear(req.query.year);
    const rows = await services.getCategorySummary.execute(year);
    res.json(rows);
  }));

  // GET /api/reports/supplier?year=2025  — datos JSON
  router.get("/supplier", asyncHandler(async (req, res) => {
    const year = parseYear(req.query.year);
    const rows = await services.getSupplierSummary.execute(year);
    res.json(rows);
  }));

  // GET /api/reports/aggregate?year=2025  — datos JSON
  router.get("/aggregate", asyncHandler(async (req, res) => {
    const year = parseYear(req.query.year);
    const summary = await services.getAggregateSummary.execute(year);
    res.json(summary);
  }));

  // GET /api/reports/export/xlsx?type=category&year=2025  — descarga Excel
  router.get("/export/xlsx", asyncHandler(async (req, res) => {
    const year = parseYear(req.query.year);
    const type = typeof req.query.type === "string" ? req.query.type : "aggregate";

    let buffer: Buffer;
    let filename: string;

    if (type === "category") {
      const rows = await services.getCategorySummary.execute(year);
      buffer = await buildCategoryXlsx(rows, year);
      filename = `reporte-categorias-${year}.xlsx`;
    } else if (type === "supplier") {
      const rows = await services.getSupplierSummary.execute(year);
      buffer = await buildSupplierXlsx(rows, year);
      filename = `reporte-proveedores-${year}.xlsx`;
    } else {
      const summary = await services.getAggregateSummary.execute(year);
      buffer = await buildAggregateXlsx(summary);
      filename = `reporte-resumen-${year}.xlsx`;
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  }));

  return router;
}
