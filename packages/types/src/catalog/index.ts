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
