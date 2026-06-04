import type { Product } from "../../domain/catalog/Product";

/** Datos para crear un producto (independiente del transporte HTTP). */
export interface CreateProductData {
  sku: string;
  name: string;
  price: number;
  category: string;
  supplierId: number;
  description?: string | null;
}

export interface PageParams {
  page: number;   // 1-based
  limit: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * APLICACIÓN — Puerto del repositorio de productos. Los casos de uso dependen de
 * esta abstracción (DIP); la infraestructura (Prisma) la implementa.
 */
export interface ProductRepository {
  listPaginated(params: PageParams): Promise<PageResult<Product>>;
  findById(id: number): Promise<Product | null>;
  searchByName(query: string, params: PageParams): Promise<PageResult<Product>>;
  searchBySku(query: string, params: PageParams): Promise<PageResult<Product>>;
  create(input: CreateProductData): Promise<Product>;
  softDelete(id: number): Promise<void>;
}
