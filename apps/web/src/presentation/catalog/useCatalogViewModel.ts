"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useServices } from "@/presentation/di/ServicesProvider";
import type { Product } from "@/domain/catalog/Product";

export type ViewStatus = "loading" | "error" | "ready";

/** MVVM — ViewModel del catálogo: carga, estado y filtros (nombre + SKU). */
export interface CatalogViewModel {
  status: ViewStatus;
  /** Productos ya filtrados por los buscadores. */
  products: Product[];
  error: string | null;
  nameQuery: string;
  skuQuery: string;
  setNameQuery: (value: string) => void;
  setSkuQuery: (value: string) => void;
  reload: () => void;
}

/**
 * Normaliza la búsqueda por SKU: toma los dígitos y los rellena con ceros a la
 * izquierda hasta 5 (p.ej. "14" -> "00014", para encontrar "SKU-00014").
 */
function normalizeSkuQuery(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits === "") return input.trim();
  return digits.length >= 5 ? digits : digits.padStart(5, "0");
}

export function useCatalogViewModel(): CatalogViewModel {
  const { listProducts } = useServices();
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [all, setAll] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nameQuery, setNameQuery] = useState("");
  const [skuQuery, setSkuQuery] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await listProducts.execute();
      setAll(data);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : null);
      setStatus("error");
    }
  }, [listProducts]);

  useEffect(() => {
    void load();
  }, [load]);

  const products = useMemo(() => {
    const name = nameQuery.trim().toLowerCase();
    const sku = skuQuery.trim() ? normalizeSkuQuery(skuQuery).toLowerCase() : "";
    return all.filter((p) => {
      const okName = name === "" || (p.name ?? "").toLowerCase().includes(name);
      const okSku = sku === "" || (p.sku ?? "").toLowerCase().includes(sku);
      return okName && okSku;
    });
  }, [all, nameQuery, skuQuery]);

  return {
    status,
    products,
    error,
    nameQuery,
    skuQuery,
    setNameQuery,
    setSkuQuery,
    reload: () => void load(),
  };
}
