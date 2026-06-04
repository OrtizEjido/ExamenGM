import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { createReportRouter } from "./reportRoutes";
import type { AppServices } from "../../infrastructure/di/container";
import type { AggregateSummary, CategorySummary, SupplierSummary } from "../../domain/reports/Report";

const catRows: CategorySummary[] = [{ category: "Alimentos", nSales: 10, gross: 5000 }];
const supRows: SupplierSummary[] = [{ supplier: "Dist MX", nSales: 5, gross: 3000 }];
const agg: AggregateSummary = {
  year: 2025, totalSales: 50, qtyTotal: 226,
  subtotal: 154000, iva: 24640, total: 178640,
};

function makeServices(ov: Partial<AppServices> = {}): AppServices {
  return {
    login: { execute: vi.fn() },
    listProducts: { execute: vi.fn() }, getProduct: { execute: vi.fn() },
    searchProductsByName: { execute: vi.fn() }, searchProductsBySku: { execute: vi.fn() },
    createProduct: { execute: vi.fn() }, deleteProduct: { execute: vi.fn() },
    listInventory: { execute: vi.fn() }, listInventoryByWarehouse: { execute: vi.fn() },
    searchInventoryByProductName: { execute: vi.fn() }, listWarehouses: { execute: vi.fn() },
    listRefunds: { execute: vi.fn() }, getRefund: { execute: vi.fn() },
    listRefundsByUser: { execute: vi.fn() }, listRefundsByStatus: { execute: vi.fn() },
    createRefund: { execute: vi.fn() }, approveRefund: { execute: vi.fn() },
    rejectRefund: { execute: vi.fn() },
    getCategorySummary: { execute: vi.fn() },
    getSupplierSummary: { execute: vi.fn() },
    getAggregateSummary: { execute: vi.fn() },
    listNotifications: { execute: vi.fn() }, markNotificationRead: { execute: vi.fn() },
    createNotification: { execute: vi.fn() }, deleteNotification: { execute: vi.fn() },
    ...ov,
  } as unknown as AppServices;
}

const app = (s: AppServices) => {
  const a = express(); a.use(express.json());
  a.use("/api/reports", createReportRouter(s)); return a;
};

describe("GET /api/reports/category", () => {
  it("retorna filas de categoría con 200", async () => {
    const s = makeServices({ getCategorySummary: { execute: vi.fn().mockResolvedValue(catRows) } });
    const res = await request(app(s)).get("/api/reports/category?year=2025");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].category).toBe("Alimentos");
    expect(typeof res.body[0].gross).toBe("number");
  });
});

describe("GET /api/reports/supplier", () => {
  it("retorna filas de proveedor con 200", async () => {
    const s = makeServices({ getSupplierSummary: { execute: vi.fn().mockResolvedValue(supRows) } });
    const res = await request(app(s)).get("/api/reports/supplier?year=2025");
    expect(res.status).toBe(200);
    expect(res.body[0].supplier).toBe("Dist MX");
  });
});

describe("GET /api/reports/aggregate", () => {
  it("retorna resumen con iva calculado", async () => {
    const s = makeServices({ getAggregateSummary: { execute: vi.fn().mockResolvedValue(agg) } });
    const res = await request(app(s)).get("/api/reports/aggregate?year=2025");
    expect(res.status).toBe(200);
    expect(res.body.totalSales).toBe(50);
    expect(res.body.iva).toBeGreaterThan(0);
  });
});

describe("GET /api/reports/export/xlsx", () => {
  it("category → devuelve Content-Type xlsx", async () => {
    const s = makeServices({ getCategorySummary: { execute: vi.fn().mockResolvedValue(catRows) } });
    const res = await request(app(s)).get("/api/reports/export/xlsx?type=category&year=2025").responseType("blob");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(res.headers["content-disposition"]).toContain("reporte-categorias-2025.xlsx");
    // El binario .xlsx empieza con la firma ZIP "PK" (0x50 0x4B)
    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toBe(0x50); // 'P'
    expect(res.body[1]).toBe(0x4b); // 'K'
  });

  it("aggregate → devuelve Content-Type xlsx", async () => {
    const s = makeServices({ getAggregateSummary: { execute: vi.fn().mockResolvedValue(agg) } });
    const res = await request(app(s)).get("/api/reports/export/xlsx?type=aggregate&year=2025");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  });
});
