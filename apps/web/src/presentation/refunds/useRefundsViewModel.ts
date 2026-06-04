"use client";

import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/presentation/di/ServicesProvider";
import type { Refund, RefundStatusCode } from "@/domain/refunds/Refund";

export type ViewStatus = "loading" | "error" | "ready";
export type FilterMode = "all" | "status";

const STATUS_CODES: RefundStatusCode[] = ["pending", "approved", "rejected", "done"];

export interface RefundsViewModel {
  status: ViewStatus;
  refunds: Refund[];
  error: string | null;
  filterMode: FilterMode;
  selectedStatus: RefundStatusCode | null;
  filterByStatus: (s: RefundStatusCode | null) => void;
  clearFilter: () => void;
}

export function useRefundsViewModel(): RefundsViewModel {
  const { listRefunds, listRefundsByStatus } = useServices();
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<FilterMode>("all");
  const [selectedStatus, setSelectedStatus] = useState<RefundStatusCode | null>(null);

  const load = useCallback(
    async (fetchMode: FilterMode, statusCode: RefundStatusCode | null) => {
      setStatus("loading"); setError(null);
      try {
        const data =
          fetchMode === "status" && statusCode
            ? await listRefundsByStatus.execute(statusCode)
            : await listRefunds.execute();
        setRefunds(data);
        setStatus("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : null);
        setStatus("error");
      }
    },
    [listRefunds, listRefundsByStatus],
  );

  useEffect(() => { void load("all", null); }, [load]);

  const filterByStatus = useCallback(
    (s: RefundStatusCode | null) => {
      if (s && STATUS_CODES.includes(s)) {
        setSelectedStatus(s); setMode("status"); void load("status", s);
      } else {
        setSelectedStatus(null); setMode("all"); void load("all", null);
      }
    },
    [load],
  );

  const clearFilter = useCallback(() => {
    setSelectedStatus(null); setMode("all"); void load("all", null);
  }, [load]);

  return { status, refunds, error, filterMode: mode, selectedStatus, filterByStatus, clearFilter };
}
