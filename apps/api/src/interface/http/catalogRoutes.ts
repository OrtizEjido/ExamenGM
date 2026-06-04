import { Router } from "express";
import type { AppServices } from "../../infrastructure/di/container";
import { asyncHandler } from "./asyncHandler";
import { toProductDto, toProductPageDto } from "./mappers";

const DEFAULT_LIMIT = 20;

function parsePage(raw: unknown): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

function parseLimit(raw: unknown): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 100 ? n : DEFAULT_LIMIT;
}

/** INTERFAZ — rutas HTTP del catálogo. */
export function createCatalogRouter(services: AppServices): Router {
  const router = Router();

  // GET /api/products?page=1&limit=20
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const page = parsePage(req.query.page);
      const limit = parseLimit(req.query.limit);
      const result = await services.listProducts.execute({ page, limit });
      res.json(toProductPageDto(result));
    }),
  );

  // GET /api/products/search/name?q=café&page=1&limit=20
  router.get(
    "/search/name",
    asyncHandler(async (req, res) => {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const page = parsePage(req.query.page);
      const limit = parseLimit(req.query.limit);
      const result = await services.searchProductsByName.execute(q, { page, limit });
      res.json(toProductPageDto(result));
    }),
  );

  // GET /api/products/search/sku?q=14&page=1&limit=20
  // El backend normaliza el query: "14" → busca SKUs que contengan "00014".
  router.get(
    "/search/sku",
    asyncHandler(async (req, res) => {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const page = parsePage(req.query.page);
      const limit = parseLimit(req.query.limit);
      const result = await services.searchProductsBySku.execute(q, { page, limit });
      res.json(toProductPageDto(result));
    }),
  );

  // GET /api/products/:id
  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }
      const product = await services.getProduct.execute(id);
      if (!product) { res.status(404).json({ error: "not found" }); return; }
      res.json(toProductDto(product));
    }),
  );

  // POST /api/products
  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const body = req.body ?? {};
      if (!body.sku || !body.name) { res.status(400).json({ error: "sku and name are required" }); return; }
      const created = await services.createProduct.execute({
        sku: String(body.sku), name: String(body.name),
        price: Number(body.price ?? 0), category: String(body.category ?? ""),
        supplierId: Number(body.supplierId ?? 0), description: body.description ?? null,
      });
      res.status(201).json(toProductDto(created));
    }),
  );

  // DELETE /api/products/:id
  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }
      await services.deleteProduct.execute(id);
      res.json({ id, deleted: true });
    }),
  );

  return router;
}
