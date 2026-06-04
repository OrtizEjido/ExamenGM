import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { createCatalogRouter } from "./catalogRoutes";
import type { AppServices } from "../../infrastructure/di/container";
import type { Product } from "../../domain/catalog/Product";
import type { PageResult } from "../../application/catalog/ProductRepository";

const NOW = new Date("2025-01-15T00:00:00.000Z");

const makeProduct = (overrides?: Partial<Product>): Product => ({
  id: 1, sku: "SKU-00001", name: "Producto Demo", description: null,
  price: 100, category: "Limpieza", supplierId: 1,
  createdAt: NOW, updatedAt: NOW, deletedAt: null,
  ...overrides,
});

const makePage = (items: Product[]): PageResult<Product> => ({
  items, total: items.length, page: 1, limit: 20,
  pages: Math.ceil(items.length / 20),
});

function makeServices(overrides: Partial<AppServices> = {}): AppServices {
  return {
    login: { execute: vi.fn() },
    listProducts: { execute: vi.fn() },
    getProduct: { execute: vi.fn() },
    searchProductsByName: { execute: vi.fn() },
    searchProductsBySku: { execute: vi.fn() },
    createProduct: { execute: vi.fn() },
    deleteProduct: { execute: vi.fn() },
    listNotifications: { execute: vi.fn() },
    markNotificationRead: { execute: vi.fn() },
    createNotification: { execute: vi.fn() },
    deleteNotification: { execute: vi.fn() },
    ...overrides,
  } as unknown as AppServices;
}

function buildApp(s: AppServices) {
  const app = express();
  app.use(express.json());
  app.use("/api/products", createCatalogRouter(s));
  return app;
}

describe("GET /api/products", () => {
  it("retorna página con items, total y metadata", async () => {
    const page = makePage([makeProduct(), makeProduct({ id: 2, sku: "SKU-00002" })]);
    const s = makeServices({ listProducts: { execute: vi.fn().mockResolvedValue(page) } });

    const res = await request(buildApp(s)).get("/api/products?page=1&limit=20");

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(2);
    expect(res.body.pages).toBe(1);
    expect(typeof res.body.items[0].createdAt).toBe("string");
  });
});

describe("GET /api/products/search/name", () => {
  it("busca por nombre y retorna página", async () => {
    const page = makePage([makeProduct({ name: "Café" })]);
    const s = makeServices({ searchProductsByName: { execute: vi.fn().mockResolvedValue(page) } });

    const res = await request(buildApp(s)).get("/api/products/search/name?q=caf%C3%A9");

    expect(res.status).toBe(200);
    expect(res.body.items[0].name).toBe("Café");
  });
});

describe("GET /api/products/search/sku", () => {
  it("busca por SKU y retorna página", async () => {
    const page = makePage([makeProduct({ sku: "SKU-00014" })]);
    const s = makeServices({ searchProductsBySku: { execute: vi.fn().mockResolvedValue(page) } });

    const res = await request(buildApp(s)).get("/api/products/search/sku?q=14");

    expect(res.status).toBe(200);
    expect(res.body.items[0].sku).toBe("SKU-00014");
  });
});

describe("GET /api/products/:id", () => {
  it("retorna el producto cuando existe", async () => {
    const s = makeServices({ getProduct: { execute: vi.fn().mockResolvedValue(makeProduct()) } });
    const res = await request(buildApp(s)).get("/api/products/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });
  it("retorna 404 cuando no existe", async () => {
    const s = makeServices({ getProduct: { execute: vi.fn().mockResolvedValue(null) } });
    const res = await request(buildApp(s)).get("/api/products/999");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/products", () => {
  it("crea y devuelve 201", async () => {
    const s = makeServices({ createProduct: { execute: vi.fn().mockResolvedValue(makeProduct({ id: 501, sku: "SKU-NEW" })) } });
    const res = await request(buildApp(s)).post("/api/products").send({ sku: "SKU-NEW", name: "Nuevo", price: 50 });
    expect(res.status).toBe(201);
    expect(res.body.sku).toBe("SKU-NEW");
  });
  it("retorna 400 si faltan campos", async () => {
    const res = await request(buildApp(makeServices())).post("/api/products").send({ name: "Sin SKU" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/products/:id", () => {
  it("soft-delete retorna 200 con deleted:true", async () => {
    const s = makeServices({ deleteProduct: { execute: vi.fn().mockResolvedValue(undefined) } });
    const res = await request(buildApp(s)).delete("/api/products/1");
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
