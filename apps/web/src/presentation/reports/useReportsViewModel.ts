"use client";

import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/presentation/di/ServicesProvider";
import type { AggregateSummary, CategorySummary, ReportType, SupplierSummary } from "@/domain/reports/Report";

export type ViewStatus = "loading" | "error" | "ready";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const CURRENT_YEAR = new Date().getFullYear();

export interface ReportsViewModel {
  status: ViewStatus;
  activeReport: ReportType;
  year: number;
  categoryRows: CategorySummary[];
  supplierRows: SupplierSummary[];
  aggregate: AggregateSummary | null;
  error: string | null;
  setActiveReport: (r: ReportType) => void;
  setYear: (y: number) => void;
  downloadXlsx: (type: ReportType) => void;
}

export function useReportsViewModel(): ReportsViewModel {
  const { getCategorySummary, getSupplierSummary, getAggregateSummary } = useServices();
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [activeReport, setActiveReportState] = useState<ReportType>("category");
  const [year, setYearState] = useState(CURRENT_YEAR);
  const [categoryRows, setCategoryRows] = useState<CategorySummary[]>([]);
  const [supplierRows, setSupplierRows] = useState<SupplierSummary[]>([]);
  const [aggregate, setAggregate] = useState<AggregateSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (report: ReportType, y: number) => {
      setStatus("loading"); setError(null);
      try {
        if (report === "category") {
          setCategoryRows(await getCategorySummary.execute(y));
        } else if (report === "supplier") {
          setSupplierRows(await getSupplierSummary.execute(y));
        } else {
          setAggregate(await getAggregateSummary.execute(y));
        }
        setStatus("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : null);
        setStatus("error");
      }
    },
    [getCategorySummary, getSupplierSummary, getAggregateSummary],
  );

  useEffect(() => { void load(activeReport, year); }, [load, activeReport, year]);

  const setActiveReport = useCallback((r: ReportType) => { setActiveReportState(r); }, []);
  const setYear = useCallback((y: number) => { setYearState(y); }, []);

  const downloadXlsx = useCallback((type: ReportType) => {
    // Descarga directa navegando a la URL del endpoint — el navegador recibe el archivo
    const url = `${API_URL}/api/reports/export/xlsx?type=${type}&year=${year}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${type}-${year}.xlsx`;
    a.click();
  }, [year]);

  return {
    status, activeReport, year, categoryRows, supplierRows, aggregate, error,
    setActiveReport, setYear, downloadXlsx,
  };
}
