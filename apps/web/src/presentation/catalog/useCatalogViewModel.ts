"use client";

import { useCallback, useEffect, useState } from "react";
import { useServices } from "@/presentation/di/ServicesProvider";
import type { Product } from "@/domain/catalog/Product";
import type { ProductPage } from "@/application/catalog/CatalogRepository";

export type ViewStatus = "loading" | "error" | "ready";

/** Modos de la tabla: lista paginada, búsqueda por nombre o por SKU. */
export type SearchMode = "list" | "name" | "sku";

export interface CatalogViewModel {
  status: ViewStatus;
  products: Product[];
  total: number;
  page: number;
  pages: number;
  error: string | null;
  nameQuery: string;
  skuQuery: string;
  searchMode: SearchMode;
  setNameQuery: (v: string) => void;
  setSkuQuery: (v: string) => void;
  /** Botón buscar por nombre → llama al API */
  searchByName: () => void;
  /** Botón buscar por SKU → llama al API */
  searchBySku: () => void;
  /** Limpiar búsqueda → vuelve a la lista paginada */
  clearSearch: () => void;
  /** Cambiar página */
  setPage: (p: number) => void;
}

const LIMIT = 20;

export function useCatalogViewModel(): CatalogViewModel {
  const { listProducts, searchProductsByName, searchProductsBySku } = useServices();

  const [status, setStatus]       = useState<ViewStatus>("loading");
  const [page, setPageState]      = useState(1);
  const [data, setData]           = useState<ProductPage>({ items: [], total: 0, page: 1, limit: LIMIT, pages: 0 });
  const [error, setError]         = useState<string | null>(null);
  const [nameQuery, setNameQuery] = useState("");
  const [skuQuery, setSkuQuery]   = useState("");
  const [mode, setMode]           = useState<SearchMode>("list");
  // El query "commiteado" (el que realmente se envió al API, no el del input en vivo)
  const [committedName, setCommittedName] = useState("");
  const [committedSku, setCommittedSku]   = useState("");

  const fetchPage = useCallback(
    async (fetchMode: SearchMode, name: string, sku: string, p: number) => {
      setStatus("loading");
      setError(null);
      try {
        let result: ProductPage;
        const params = { page: p, limit: LIMIT };
        if (fetchMode === "name") result = await searchProductsByName.execute(name, params);
        else if (fetchMode === "sku") result = await searchProductsBySku.execute(sku, params);
        else result = await listProducts.execute(params);
        setData(result);
        setStatus("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : null);
        setStatus("error");
      }
    },
    [listProducts, searchProductsByName, searchProductsBySku],
  );

  // Carga inicial
  useEffect(() => { void fetchPage("list", "", "", 1); }, [fetchPage]);

  const searchByName = useCallback(() => {
    const q = nameQuery.trim();
    setCommittedName(q);
    setCommittedSku("");
    setMode("name");
    setPageState(1);
    void fetchPage("name", q, "", 1);
  }, [nameQuery, fetchPage]);

  const searchBySku = useCallback(() => {
    const q = skuQuery.trim();
    setCommittedSku(q);
    setCommittedName("");
    setMode("sku");
    setPageState(1);
    void fetchPage("sku", "", q, 1);
  }, [skuQuery, fetchPage]);

  const clearSearch = useCallback(() => {
    setNameQuery("");
    setSkuQuery("");
    setCommittedName("");
    setCommittedSku("");
    setMode("list");
    setPageState(1);
    void fetchPage("list", "", "", 1);
  }, [fetchPage]);

  const setPage = useCallback(
    (p: number) => {
      setPageState(p);
      void fetchPage(mode, committedName, committedSku, p);
    },
    [mode, committedName, committedSku, fetchPage],
  );

  return {
    status,
    products: data.items,
    total: data.total,
    page: data.page,
    pages: data.pages,
    error,
    nameQuery,
    skuQuery,
    searchMode: mode,
    setNameQuery,
    setSkuQuery,
    searchByName,
    searchBySku,
    clearSearch,
    setPage,
  };
}
