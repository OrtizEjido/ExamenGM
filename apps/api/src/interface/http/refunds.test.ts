import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { createRefundRouter } from "./refundRoutes";
import type { AppServices } from "../../infrastructure/di/container";
import type { Refund } from "../../domain/refunds/Refund";

const NOW = new Date("2025-06-01T00:00:00.000Z");

const makeRefund = (o?: Partial<Refund>): Refund => ({
  id: 1, saleId: 10, userId: 2, reason: "Producto defectuoso",
  amount: 999.99, status: "pending", approvedBy: null, createdAt: NOW, ...o,
});

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
    listNotifications: { execute: vi.fn() }, markNotificationRead: { execute: vi.fn() },
    createNotification: { execute: vi.fn() }, deleteNotification: { execute: vi.fn() },
    ...ov,
  } as unknown as AppServices;
}

const app = (s: AppServices) => {
  const a = express(); a.use(express.json());
  a.use("/api/refunds", createRefundRouter(s)); return a;
};

describe("GET /api/refunds", () => {
  it("retorna la lista con 200", async () => {
    const s = makeServices({ listRefunds: { execute: vi.fn().mockResolvedValue([makeRefund(), makeRefund({ id: 2 })]) } });
    const res = await request(app(s)).get("/api/refunds");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(typeof res.body[0].amount).toBe("number");
    expect(typeof res.body[0].createdAt).toBe("string");
  });
});

describe("GET /api/refunds/search/status", () => {
  it("filtra por status válido", async () => {
    const s = makeServices({ listRefundsByStatus: { execute: vi.fn().mockResolvedValue([makeRefund({ status: "approved" })]) } });
    const res = await request(app(s)).get("/api/refunds/search/status?q=approved");
    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe("approved");
  });
  it("retorna 400 con status inválido", async () => {
    const res = await request(app(makeServices())).get("/api/refunds/search/status?q=invalid");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/refunds/by-user/:uid", () => {
  it("retorna los reembolsos del usuario", async () => {
    const s = makeServices({ listRefundsByUser: { execute: vi.fn().mockResolvedValue([makeRefund({ userId: 3 })]) } });
    const res = await request(app(s)).get("/api/refunds/by-user/3");
    expect(res.status).toBe(200);
    expect(res.body[0].userId).toBe(3);
  });
});

describe("GET /api/refunds/:id", () => {
  it("retorna 200 cuando existe", async () => {
    const s = makeServices({ getRefund: { execute: vi.fn().mockResolvedValue(makeRefund()) } });
    const res = await request(app(s)).get("/api/refunds/1");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });
  it("retorna 404 cuando no existe", async () => {
    const s = makeServices({ getRefund: { execute: vi.fn().mockResolvedValue(null) } });
    const res = await request(app(s)).get("/api/refunds/999");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/refunds", () => {
  it("crea y devuelve 201", async () => {
    const created = makeRefund({ status: "pending" });
    const s = makeServices({ createRefund: { execute: vi.fn().mockResolvedValue(created) } });
    const res = await request(app(s)).post("/api/refunds")
      .send({ saleId: 10, userId: 2, reason: "Test", amount: 999.99 });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
  });
  it("retorna 400 si faltan campos", async () => {
    const res = await request(app(makeServices())).post("/api/refunds").send({ saleId: 1 });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/refunds/:id/approve", () => {
  it("aprueba y retorna el reembolso actualizado", async () => {
    const approved = makeRefund({ status: "approved", approvedBy: 1 });
    const s = makeServices({ approveRefund: { execute: vi.fn().mockResolvedValue(approved) } });
    const res = await request(app(s)).post("/api/refunds/1/approve").send({ approvedBy: 1 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
    expect(res.body.approvedBy).toBe(1);
  });
  it("retorna 404 si no existe", async () => {
    const s = makeServices({ approveRefund: { execute: vi.fn().mockResolvedValue(null) } });
    const res = await request(app(s)).post("/api/refunds/999/approve").send({ approvedBy: 1 });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/refunds/:id/reject", () => {
  it("rechaza y retorna 200", async () => {
    const rejected = makeRefund({ status: "rejected" });
    const s = makeServices({ rejectRefund: { execute: vi.fn().mockResolvedValue(rejected) } });
    const res = await request(app(s)).post("/api/refunds/1/reject");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("rejected");
  });
});
