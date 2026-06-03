"use client";

import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/presentation/di/ServicesProvider";
import type { DashboardSummary } from "@/domain/dashboard/DashboardSummary";

export type ViewStatus = "loading" | "error" | "ready";

/**
 * MVVM — ViewModel del dashboard.
 *
 * Orquesta el caso de uso y expone estado de presentación (carga/error/datos)
 * a la View. No contiene JSX, reglas de negocio ni textos de UI (la View resuelve
 * los mensajes vía i18n); solo guarda el mensaje técnico del error si lo hay.
 */
export interface DashboardViewModel {
  status: ViewStatus;
  summary: DashboardSummary | null;
  error: string | null;
  reload: () => void;
}

export function useDashboardViewModel(): DashboardViewModel {
  const { getDashboardSummary } = useServices();
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await getDashboardSummary.execute();
      setSummary(data);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : null);
      setStatus("error");
    }
  }, [getDashboardSummary]);

  useEffect(() => {
    void load();
  }, [load]);

  return { status, summary, error, reload: () => void load() };
}
