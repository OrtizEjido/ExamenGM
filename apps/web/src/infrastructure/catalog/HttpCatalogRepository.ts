import type { Product as ProductDto } from "@erp/types";
import type { CatalogRepository } from "@/application/catalog/CatalogRepository";
import type { Product } from "@/domain/catalog/Product";
import { apiGet } from "../http/apiClient";

/** INFRAESTRUCTURA — Adapter HTTP del puerto CatalogRepository (consume apps/api). */
export class HttpCatalogRepository implements CatalogRepository {
  async list(): Promise<Product[]> {
    const dtos = await apiGet<ProductDto[]>("/api/products");
    return dtos.map((d) => ({
      id: d.id,
      sku: d.sku,
      name: d.name,
      description: d.description,
      price: d.price,
      category: d.category,
      supplierId: d.supplierId,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      deletedAt: d.deletedAt,
    }));
  }
}
