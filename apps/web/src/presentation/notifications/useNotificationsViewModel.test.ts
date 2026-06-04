import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotificationsViewModel } from "./useNotificationsViewModel";
import type { Notification } from "@/domain/notifications/Notification";

/** Referencias estables al mock para evitar bucle de re-renders (ver catalog test). */
const { mockList, mockMarkRead, stableServices } = vi.hoisted(() => {
  const mockList = vi.fn<(userId: number) => Promise<Notification[]>>();
  const mockMarkRead = vi.fn<(id: number) => Promise<Notification>>();
  const stableServices = {
    listNotifications: { execute: mockList },
    markNotificationRead: { execute: mockMarkRead },
  };
  return { mockList, mockMarkRead, stableServices };
});

vi.mock("@/presentation/di/ServicesProvider", () => ({
  useServices: () => stableServices,
}));

const makeNotif = (overrides?: Partial<Notification>): Notification => ({
  id: 1,
  userId: 2,
  message: "Aviso de prueba",
  kind: "info",
  read: false,
  createdAt: "2025-06-01T00:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useNotificationsViewModel", () => {
  it("carga las notificaciones y termina en ready", async () => {
    const items = [makeNotif(), makeNotif({ id: 2, read: true })];
    mockList.mockResolvedValue(items);

    const { result } = renderHook(() => useNotificationsViewModel());

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.notifications).toHaveLength(2);
  });

  it("pasa a error cuando el repositorio falla", async () => {
    mockList.mockRejectedValue(new Error("red caída"));

    const { result } = renderHook(() => useNotificationsViewModel());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("red caída");
  });

  it("markRead actualiza read:true en el estado local sin recargar la lista", async () => {
    const notifUnread = makeNotif({ id: 5, read: false });
    mockList.mockResolvedValue([notifUnread]);
    mockMarkRead.mockResolvedValue({ ...notifUnread, read: true });

    const { result } = renderHook(() => useNotificationsViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => { await result.current.markRead(5); });

    expect(result.current.notifications.find((n) => n.id === 5)?.read).toBe(true);
    expect(mockList).toHaveBeenCalledTimes(1); // no recargó la lista
  });

  it("markRead agrega el id a markingIds durante la petición y lo retira al finalizar", async () => {
    const notifUnread = makeNotif({ id: 5, read: false });
    mockList.mockResolvedValue([notifUnread]);

    let resolve!: (n: Notification) => void;
    mockMarkRead.mockReturnValue(
      new Promise<Notification>((res) => { resolve = res; }),
    );

    const { result } = renderHook(() => useNotificationsViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => { void result.current.markRead(5); });
    await waitFor(() => expect(result.current.markingIds).toContain(5));

    await act(async () => { resolve({ ...notifUnread, read: true }); });
    expect(result.current.markingIds).not.toContain(5);
  });
});
