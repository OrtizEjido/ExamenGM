/**
 * DOMINIO (frontend) — Producto. Independiente del DTO de transporte; el adapter
 * HTTP mapea el contrato de `@erp/types` hacia este modelo.
 */
export interface Product {
  id: number;
  sku: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  supplierId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}
