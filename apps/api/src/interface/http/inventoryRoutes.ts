import { Router } from "express";
import type { AppServices } from "../../infrastructure/di/container";
import { asyncHandler } from "./asyncHandler";
import { toInventoryPageDto, toWarehouseDto } from "./mappers";

const DEFAULT_LIMIT = 20;

function parsePage(raw: unknown): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}
function parseLimit(raw: unknown): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 100 ? n : DEFAULT_LIMIT;
}

/** INTERFAZ — rutas HTTP del inventario. */
export function createInventoryRouter(services: AppServices): Router {
  const router = Router();

  // GET /api/inventory/warehouses
  router.get(
    "/warehouses",
    asyncHandler(async (_req, res) => {
      const warehouses = await services.listWarehouses.execute();
      res.json(warehouses.map(toWarehouseDto));
    }),
  );

  // GET /api/inventory/search/name?q=café&page=1
  router.get(
    "/search/name",
    asyncHandler(async (req, res) => {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const params = { page: parsePage(req.query.page), limit: parseLimit(req.query.limit) };
      const result = await services.searchInventoryByProductName.execute(q, params);
      res.json(toInventoryPageDto(result));
    }),
  );

  // GET /api/inventory/warehouse/:id?page=1
  router.get(
    "/warehouse/:id",
    asyncHandler(async (req, res) => {
      const wid = Number(req.params.id);
      if (!Number.isInteger(wid)) { res.status(400).json({ error: "invalid warehouse id" }); return; }
      const params = { page: parsePage(req.query.page), limit: parseLimit(req.query.limit) };
      const result = await services.listInventoryByWarehouse.execute(wid, params);
      res.json(toInventoryPageDto(result));
    }),
  );

  // GET /api/inventory?page=1&limit=20
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const params = { page: parsePage(req.query.page), limit: parseLimit(req.query.limit) };
      const result = await services.listInventory.execute(params);
      res.json(toInventoryPageDto(result));
    }),
  );

  return router;
}
