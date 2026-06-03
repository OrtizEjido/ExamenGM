"use client";

import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/presentation/di/ServicesProvider";
import type { Product } from "@/domain/catalog/Product";

export type ViewStatus = "loading" | "error" | "ready";

/** MVVM — ViewModel del catálogo: orquesta el caso de uso y expone el estado. */
export interface CatalogViewModel {
  status: ViewStatus;
  products: Product[];
  error: string | null;
  reload: () => void;
}

export function useCatalogViewModel(): CatalogViewModel {
  const { listProducts } = useServices();
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await listProducts.execute();
      setProducts(data);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : null);
      setStatus("error");
    }
  }, [listProducts]);

  useEffect(() => {
    void load();
  }, [load]);

  return { status, products, error, reload: () => void load() };
}
