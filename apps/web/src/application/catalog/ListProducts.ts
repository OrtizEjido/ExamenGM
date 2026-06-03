import type { Product } from "@/domain/catalog/Product";
import type { CatalogRepository } from "./CatalogRepository";

/** Caso de uso: listar productos del catálogo. */
export class ListProducts {
  constructor(private readonly repository: CatalogRepository) {}
  execute(): Promise<Product[]> {
    return this.repository.list();
  }
}
