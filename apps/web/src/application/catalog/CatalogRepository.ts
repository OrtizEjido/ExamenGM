import type { Product } from "@/domain/catalog/Product";

export interface PageParams {
  page: number;
  limit: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** APLICACIÓN — Puerto del catálogo con paginado y búsqueda server-side. */
export interface CatalogRepository {
  listPaginated(params: PageParams): Promise<ProductPage>;
  searchByName(query: string, params: PageParams): Promise<ProductPage>;
  searchBySku(query: string, params: PageParams): Promise<ProductPage>;
}
