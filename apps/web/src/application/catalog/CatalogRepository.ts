import type { Product } from "@/domain/catalog/Product";

/** APLICACIÓN — Puerto del catálogo. La infraestructura HTTP lo implementa. */
export interface CatalogRepository {
  list(): Promise<Product[]>;
}
