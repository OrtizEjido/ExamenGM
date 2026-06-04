import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import { createNotificationRouter } from "./notificationRoutes";
import type { AppServices } from "../../infrastructure/di/container";
import type { Notification } from "../../domain/notifications/Notification";

// ── helpers ──────────────────────────────────────────────────────────────────

const NOW = new Date("2025-06-01T00:00:00.000Z");

const makeNotif = (overrides?: Partial<Notification>): Notification => ({
  id: 1,
  userId: 2,
  message: "Aviso de prueba",
  kind: "info",
  read: false,
  createdAt: NOW,
  ...overrides,
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

function buildApp(services: AppServices) {
  const app = express();
  app.use(express.json());
  app.use("/api/notifications", createNotificationRouter(services));
  return app;
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("GET /api/notifications/:userId", () => {
  it("retorna las notificaciones del usuario con status 200", async () => {
    const items = [makeNotif(), makeNotif({ id: 2, read: true })];
    const services = makeServices({
      listNotifications: { execute: vi.fn().mockResolvedValue(items) },
    });

    const res = await request(buildApp(services)).get("/api/notifications/2");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    // El campo es booleano, no string
    expect(typeof res.body[0].read).toBe("boolean");
    expect(res.body[0].read).toBe(false);
    expect(res.body[1].read).toBe(true);
    // No debe existir campo 'status' (fue eliminado)
    expect(res.body[0].status).toBeUndefined();
  });
});

describe("POST /api/notifications/:id/read", () => {
  it("marca como leída y retorna read:true", async () => {
    const updated = makeNotif({ read: true });
    const services = makeServices({
      markNotificationRead: { execute: vi.fn().mockResolvedValue(updated) },
    });

    const res = await request(buildApp(services)).post(
      "/api/notifications/1/read",
    );

    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it("retorna 404 cuando la notificación no existe", async () => {
    const services = makeServices({
      markNotificationRead: { execute: vi.fn().mockResolvedValue(null) },
    });

    const res = await request(buildApp(services)).post(
      "/api/notifications/999/read",
    );

    expect(res.status).toBe(404);
  });
});

describe("POST /api/notifications", () => {
  it("crea y devuelve 201 con read:false", async () => {
    const created = makeNotif({ id: 31, read: false });
    const services = makeServices({
      createNotification: { execute: vi.fn().mockResolvedValue(created) },
    });

    const res = await request(buildApp(services))
      .post("/api/notifications")
      .send({ userId: 2, message: "Nuevo aviso" });

    expect(res.status).toBe(201);
    expect(res.body.read).toBe(false);
  });

  it("retorna 400 si faltan userId o message", async () => {
    const services = makeServices();

    const res = await request(buildApp(services))
      .post("/api/notifications")
      .send({ message: "Sin userId" });

    expect(res.status).toBe(400);
  });
});
