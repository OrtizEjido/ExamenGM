/** Bounded context: Catalog (productos). */
import type { Id, LegacyDateString } from "../common";

// --- Entidad: fila de la tabla `products` ---
export interface ProductRow {
  id: Id;
  sku: string | null;
  name: string | null;
  description: string | null;
  /** REAL en SQLite. */
  price: number | null;
  category: string | null;
  supplier_id: Id | null;
  created_at: LegacyDateString | null;
  updated_at: LegacyDateString | null;
  /** Soft-delete: NULL = activo. */
  deleted_at: LegacyDateString | null;
}

// --- API ---

// GET  /api/products          -> ProductRow[]
// GET  /api/products/search?q -> ProductRow[]
// GET  /api/products/:id      -> ProductRow | ErrorResponse

/** POST /api/products */
export interface CreateProductRequest {
  sku: string;
  name: string;
  price: number;
  category: string;
  supplier_id: Id;
}
export interface CreateProductResponse {
  id: Id;
}

/** DELETE /api/products/:id (body: AdminAuthPayload) */
export interface DeleteProductResponse {
  id: Id;
  deleted: boolean;
}

// ---------------------------------------------------------------------------
// Contrato NORMALIZADO (API nueva, apps/api). Fechas en ISO 8601, camelCase.
// `ProductRow` de arriba queda como referencia 1:1 del legacy.
// ---------------------------------------------------------------------------

export interface Product {
  id: Id;
  sku: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  supplierId: Id | null;
  /** ISO 8601 o null. */
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

/** Respuesta paginada del catálogo. */
export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** Cuerpo para crear un producto (POST /api/products). */
export interface CreateProductInput {
  sku: string;
  name: string;
  price: number;
  category: string;
  supplierId: Id;
  description?: string | null;
}
