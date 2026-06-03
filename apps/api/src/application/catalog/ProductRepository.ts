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

/**
 * APLICACIÓN — Puerto del repositorio de productos. Los casos de uso dependen de
 * esta abstracción (DIP); la infraestructura (Prisma) la implementa.
 */
export interface ProductRepository {
  listActive(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  search(query: string): Promise<Product[]>;
  create(input: CreateProductData): Promise<Product>;
  softDelete(id: number): Promise<void>;
}
