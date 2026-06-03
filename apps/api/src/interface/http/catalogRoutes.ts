import { Router } from "express";
import type { AppServices } from "../../infrastructure/di/container";
import { asyncHandler } from "./asyncHandler";
import { toProductDto } from "./mappers";

/** INTERFAZ — rutas HTTP del catálogo. Entrada/salida tipadas con @erp/types. */
export function createCatalogRouter(services: AppServices): Router {
  const router = Router();

  // GET /api/products
  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const products = await services.listProducts.execute();
      res.json(products.map(toProductDto));
    }),
  );

  // GET /api/products/search?q=...  (antes de /:id)
  router.get(
    "/search",
    asyncHandler(async (req, res) => {
      const q = typeof req.query.q === "string" ? req.query.q : "";
      const products = await services.searchProducts.execute(q);
      res.json(products.map(toProductDto));
    }),
  );

  // GET /api/products/:id
  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
      }
      const product = await services.getProduct.execute(id);
      if (!product) {
        res.status(404).json({ error: "not found" });
        return;
      }
      res.json(toProductDto(product));
    }),
  );

  // POST /api/products
  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const body = req.body ?? {};
      if (!body.sku || !body.name) {
        res.status(400).json({ error: "sku and name are required" });
        return;
      }
      const created = await services.createProduct.execute({
        sku: String(body.sku),
        name: String(body.name),
        price: Number(body.price ?? 0),
        category: String(body.category ?? ""),
        supplierId: Number(body.supplierId ?? 0),
        description: body.description ?? null,
      });
      res.status(201).json(toProductDto(created));
    }),
  );

  // DELETE /api/products/:id  (soft delete)
  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
      }
      await services.deleteProduct.execute(id);
      res.json({ id, deleted: true });
    }),
  );

  return router;
}
