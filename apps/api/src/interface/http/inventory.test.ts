import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { createInventoryRouter } from "./inventoryRoutes";
import type { AppServices } from "../../infrastructure/di/container";
import type { InventoryItem, Warehouse } from "../../domain/inventory/InventoryItem";
import type { PageResult } from "../../application/inventory/InventoryRepository";

const makeItem = (o?: Partial<InventoryItem>): InventoryItem => ({
  productId: 1, sku: "SKU-00001", productName: "Prod Demo",
  warehouseId: 1, warehouseName: "Centro", warehouseRegion: "CDMX", quantity: 50, ...o,
});
const makePage = (items: InventoryItem[]): PageResult<InventoryItem> => ({
  items, total: items.length, page: 1, limit: 20, pages: 1,
});

function makeServices(ov: Partial<AppServices> = {}): AppServices {
  return {
    login: { execute: vi.fn() },
    listProducts: { execute: vi.fn() }, getProduct: { execute: vi.fn() },
    searchProductsByName: { execute: vi.fn() }, searchProductsBySku: { execute: vi.fn() },
    createProduct: { execute: vi.fn() }, deleteProduct: { execute: vi.fn() },
    listInventory: { execute: vi.fn() },
    listInventoryByWarehouse: { execute: vi.fn() },
    searchInventoryByProductName: { execute: vi.fn() },
    listWarehouses: { execute: vi.fn() },
    listNotifications: { execute: vi.fn() }, markNotificationRead: { execute: vi.fn() },
    createNotification: { execute: vi.fn() }, deleteNotification: { execute: vi.fn() },
    ...ov,
  } as unknown as AppServices;
}

const app = (s: AppServices) => {
  const a = express(); a.use(express.json());
  a.use("/api/inventory", createInventoryRouter(s)); return a;
};

describe("GET /api/inventory", () => {
  it("retorna página con metadata correcta", async () => {
    const page = makePage([makeItem(), makeItem({ productId: 2, sku: "SKU-00002" })]);
    const s = makeServices({ listInventory: { execute: vi.fn().mockResolvedValue(page) } });
    const res = await request(app(s)).get("/api/inventory?page=1&limit=20");
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(2);
    expect(res.body.pages).toBe(1);
  });
});

describe("GET /api/inventory/warehouses", () => {
  it("retorna lista de almacenes", async () => {
    const whs: Warehouse[] = [{ id: 1, name: "Centro", region: "CDMX" }];
    const s = makeServices({ listWarehouses: { execute: vi.fn().mockResolvedValue(whs) } });
    const res = await request(app(s)).get("/api/inventory/warehouses");
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Centro");
  });
});

describe("GET /api/inventory/warehouse/:id", () => {
  it("filtra por almacén y retorna 200", async () => {
    const page = makePage([makeItem({ warehouseId: 2 })]);
    const s = makeServices({ listInventoryByWarehouse: { execute: vi.fn().mockResolvedValue(page) } });
    const res = await request(app(s)).get("/api/inventory/warehouse/2");
    expect(res.status).toBe(200);
    expect(res.body.items[0].warehouseId).toBe(2);
  });
  it("retorna 400 con id inválido", async () => {
    const res = await request(app(makeServices())).get("/api/inventory/warehouse/abc");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/inventory/search/name", () => {
  it("busca por nombre y retorna página", async () => {
    const page = makePage([makeItem({ productName: "Café" })]);
    const s = makeServices({ searchInventoryByProductName: { execute: vi.fn().mockResolvedValue(page) } });
    const res = await request(app(s)).get("/api/inventory/search/name?q=caf%C3%A9");
    expect(res.status).toBe(200);
    expect(res.body.items[0].productName).toBe("Café");
  });
});
