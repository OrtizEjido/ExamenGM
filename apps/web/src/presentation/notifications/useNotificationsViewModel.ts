"use client";

import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/presentation/di/ServicesProvider";
import { useSession } from "@/presentation/auth/useSession";
import type { Notification } from "@/domain/notifications/Notification";

export type ViewStatus = "loading" | "error" | "ready";

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
  const session = useSession();
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [markingIds, setMarkingIds] = useState<number[]>([]);

  const load = useCallback(async () => {
    // Hasta que la sesión se hidrate desde localStorage no hacemos la petición.
    if (!session) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await listNotifications.execute(session.user.id);
      setNotifications(data);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : null);
      setStatus("error");
    }
  }, [listNotifications, session]);

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
