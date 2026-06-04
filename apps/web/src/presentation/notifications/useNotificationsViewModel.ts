"use client";

import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/presentation/di/ServicesProvider";
import type { Notification } from "@/domain/notifications/Notification";

export type ViewStatus = "loading" | "error" | "ready";

/**
 * Usuario "actual" del demo. La sesión real (login) aún no propaga un userId,
 * así que se fija el usuario con más notificaciones para ilustrar el módulo.
 */
export const DEMO_USER_ID = 2;

export interface NotificationsViewModel {
  status: ViewStatus;
  notifications: Notification[];
  error: string | null;
  markingIds: number[];
  reload: () => void;
  markRead: (id: number) => Promise<void>;
}

export function useNotificationsViewModel(): NotificationsViewModel {
  const { listNotifications, markNotificationRead } = useServices();
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [markingIds, setMarkingIds] = useState<number[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await listNotifications.execute(DEMO_USER_ID);
      setNotifications(data);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : null);
      setStatus("error");
    }
  }, [listNotifications]);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = useCallback(
    async (id: number) => {
      setMarkingIds((ids) => [...ids, id]);
      try {
        const updated = await markNotificationRead.execute(id);
        setNotifications((list) =>
          list.map((n) => (n.id === id ? { ...n, read: updated.read } : n)),
        );
      } finally {
        setMarkingIds((ids) => ids.filter((x) => x !== id));
      }
    },
    [markNotificationRead],
  );

  return {
    status,
    notifications,
    error,
    markingIds,
    reload: () => void load(),
    markRead,
  };
}
