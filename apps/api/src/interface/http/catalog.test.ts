import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { createCatalogRouter } from "./catalogRoutes";
import type { AppServices } from "../../infrastructure/di/container";
import type { Product } from "../../domain/catalog/Product";

// ── helpers ──────────────────────────────────────────────────────────────────

const NOW = new Date("2025-01-15T00:00:00.000Z");

const makeProduct = (overrides?: Partial<Product>): Product => ({
  id: 1,
  sku: "SKU-00001",
  name: "Producto Demo",
  description: null,
  price: 100,
  category: "Limpieza",
  supplierId: 1,
  createdAt: NOW,
  updatedAt: NOW,
  deletedAt: null,
  ...overrides,
});

function makeServices(overrides: Partial<AppServices> = {}): AppServices {
  return {
    login: { execute: vi.fn() },
    listProducts: { execute: vi.fn() },
    getProduct: { execute: vi.fn() },
    searchProducts: { execute: vi.fn() },
    createProduct: { execute: vi.fn() },
    deleteProduct: { execute: vi.fn() },
    listNotifications: { execute: vi.fn() },
    markNotificationRead: { execute: vi.fn() },
    createNotification: { execute: vi.fn() },
    deleteNotification: { execute: vi.fn() },
    ...overrides,
  } as unknown as AppServices;
}

function buildApp(services: AppServices) {
  const app = express();
  app.use(express.json());
  app.use("/api/products", createCatalogRouter(services));
  return app;
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("GET /api/products", () => {
  it("retorna la lista de productos con status 200", async () => {
    const products = [makeProduct(), makeProduct({ id: 2, sku: "SKU-00002" })];
    const services = makeServices({
      listProducts: { execute: vi.fn().mockResolvedValue(products) },
    });

    const res = await request(buildApp(services)).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].sku).toBe("SKU-00001");
    // Fechas deben ser strings ISO
    expect(typeof res.body[0].createdAt).toBe("string");
  });
});

describe("GET /api/products/:id", () => {
  it("retorna el producto cuando existe", async () => {
    const services = makeServices({
      getProduct: { execute: vi.fn().mockResolvedValue(makeProduct()) },
    });

    const res = await request(buildApp(services)).get("/api/products/1");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it("retorna 404 cuando no existe", async () => {
    const services = makeServices({
      getProduct: { execute: vi.fn().mockResolvedValue(null) },
    });

    const res = await request(buildApp(services)).get("/api/products/999");

    expect(res.status).toBe(404);
  });
});

describe("POST /api/products", () => {
  it("crea el producto y devuelve 201", async () => {
    const created = makeProduct({ id: 501, sku: "SKU-NEW" });
    const services = makeServices({
      createProduct: { execute: vi.fn().mockResolvedValue(created) },
    });

    const res = await request(buildApp(services))
      .post("/api/products")
      .send({ sku: "SKU-NEW", name: "Nuevo", price: 50, supplierId: 1 });

    expect(res.status).toBe(201);
    expect(res.body.sku).toBe("SKU-NEW");
  });

  it("retorna 400 si faltan sku o name", async () => {
    const services = makeServices();

    const res = await request(buildApp(services))
      .post("/api/products")
      .send({ name: "Sin SKU" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});

describe("DELETE /api/products/:id", () => {
  it("soft-delete retorna 200 con deleted:true", async () => {
    const deleted = makeProduct({ deletedAt: NOW });
    const services = makeServices({
      deleteProduct: { execute: vi.fn().mockResolvedValue(deleted) },
    });

    const res = await request(buildApp(services)).delete("/api/products/1");

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
