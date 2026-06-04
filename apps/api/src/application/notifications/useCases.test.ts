import { describe, it, expect, vi } from "vitest";
import {
  ListNotifications,
  MarkNotificationRead,
  CreateNotification,
  DeleteNotification,
} from "./useCases";
import type { NotificationRepository } from "./NotificationRepository";
import type { Notification } from "../../domain/notifications/Notification";

const NOW = new Date("2025-06-01T00:00:00.000Z");

const makeNotif = (overrides?: Partial<Notification>): Notification => ({
  id: 1,
  userId: 2,
  message: "Notificación de prueba",
  kind: "info",
  read: false,
  createdAt: NOW,
  ...overrides,
});

const makeRepo = (): NotificationRepository => ({
  listForUser: vi.fn(),
  markRead: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
});

describe("ListNotifications", () => {
  it("retorna las notificaciones del usuario", async () => {
    const repo = makeRepo();
    const items = [makeNotif(), makeNotif({ id: 2, read: true })];
    vi.mocked(repo.listForUser).mockResolvedValue(items);

    const result = await new ListNotifications(repo).execute(2);

    expect(result).toEqual(items);
    expect(repo.listForUser).toHaveBeenCalledWith(2);
  });
});

describe("MarkNotificationRead", () => {
  it("retorna la notificación con read=true", async () => {
    const repo = makeRepo();
    const updated = makeNotif({ read: true });
    vi.mocked(repo.markRead).mockResolvedValue(updated);

    const result = await new MarkNotificationRead(repo).execute(1);

    expect(result?.read).toBe(true);
    expect(repo.markRead).toHaveBeenCalledWith(1);
  });

  it("retorna null cuando el id no existe", async () => {
    const repo = makeRepo();
    vi.mocked(repo.markRead).mockResolvedValue(null);

    const result = await new MarkNotificationRead(repo).execute(999);

    expect(result).toBeNull();
  });
});

describe("CreateNotification", () => {
  it("crea con read=false por defecto", async () => {
    const repo = makeRepo();
    const created = makeNotif({ read: false });
    vi.mocked(repo.create).mockResolvedValue(created);

    const result = await new CreateNotification(repo).execute({
      userId: 2,
      message: "Nuevo aviso",
      kind: "system",
    });

    expect(result.read).toBe(false);
    expect(repo.create).toHaveBeenCalledOnce();
  });
});

describe("DeleteNotification", () => {
  it("llama delete con el id correcto", async () => {
    const repo = makeRepo();
    vi.mocked(repo.delete).mockResolvedValue(undefined);

    await new DeleteNotification(repo).execute(5);

    expect(repo.delete).toHaveBeenCalledWith(5);
  });
});
