"use client";

import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/presentation/di/ServicesProvider";
import type { InventoryItem, Warehouse } from "@/domain/inventory/InventoryItem";
import type { InventoryPage } from "@/application/inventory/InventoryRepository";

export type ViewStatus = "loading" | "error" | "ready";
export type SearchMode = "all" | "warehouse" | "name";

export interface InventoryViewModel {
  status: ViewStatus;
  items: InventoryItem[];
  total: number; page: number; pages: number;
  error: string | null;
  warehouses: Warehouse[];
  selectedWarehouse: number | null;
  nameQuery: string;
  searchMode: SearchMode;
  setNameQuery: (v: string) => void;
  setSelectedWarehouse: (id: number | null) => void;
  searchByName: () => void;
  filterByWarehouse: (id: number | null) => void;
  clearSearch: () => void;
  setPage: (p: number) => void;
}

const LIMIT = 20;

export function useInventoryViewModel(): InventoryViewModel {
  const { listInventory, listInventoryByWarehouse, searchInventoryByProductName, listWarehouses } =
    useServices();

  const [status, setStatus] = useState<ViewStatus>("loading");
  const [data, setData] = useState<InventoryPage>({ items: [], total: 0, page: 1, limit: LIMIT, pages: 0 });
  const [error, setError] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [nameQuery, setNameQuery] = useState("");
  const [committedName, setCommittedName] = useState("");
  const [selectedWarehouse, setSelectedWarehouseState] = useState<number | null>(null);
  const [mode, setMode] = useState<SearchMode>("all");

  const fetchPage = useCallback(
    async (fetchMode: SearchMode, name: string, warehouseId: number | null, p: number) => {
      setStatus("loading");
      setError(null);
      try {
        const params = { page: p, limit: LIMIT };
        let result: InventoryPage;
        if (fetchMode === "name") result = await searchInventoryByProductName.execute(name, params);
        else if (fetchMode === "warehouse" && warehouseId != null)
          result = await listInventoryByWarehouse.execute(warehouseId, params);
        else result = await listInventory.execute(params);
        setData(result);
        setStatus("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : null);
        setStatus("error");
      }
    },
    [listInventory, listInventoryByWarehouse, searchInventoryByProductName],
  );

  // Carga inicial + almacenes
  useEffect(() => {
    void fetchPage("all", "", null, 1);
    listWarehouses.execute().then(setWarehouses).catch(() => {});
  }, [fetchPage, listWarehouses]);

  const searchByName = useCallback(() => {
    const q = nameQuery.trim();
    setCommittedName(q);
    setSelectedWarehouseState(null);
    setMode("name");
    void fetchPage("name", q, null, 1);
  }, [nameQuery, fetchPage]);

  const filterByWarehouse = useCallback(
    (id: number | null) => {
      setSelectedWarehouseState(id);
      setNameQuery("");
      setCommittedName("");
      const newMode: SearchMode = id == null ? "all" : "warehouse";
      setMode(newMode);
      void fetchPage(newMode, "", id, 1);
    },
    [fetchPage],
  );

  const clearSearch = useCallback(() => {
    setNameQuery(""); setCommittedName("");
    setSelectedWarehouseState(null);
    setMode("all");
    void fetchPage("all", "", null, 1);
  }, [fetchPage]);

  const setPage = useCallback(
    (p: number) => void fetchPage(mode, committedName, selectedWarehouse, p),
    [mode, committedName, selectedWarehouse, fetchPage],
  );

  return {
    status, items: data.items, total: data.total, page: data.page, pages: data.pages,
    error, warehouses, selectedWarehouse, nameQuery, searchMode: mode,
    setNameQuery, setSelectedWarehouse: filterByWarehouse,
    searchByName, filterByWarehouse, clearSearch, setPage,
  };
}
