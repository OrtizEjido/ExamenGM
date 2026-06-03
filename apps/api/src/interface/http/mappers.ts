import type { Product as ProductDto } from "@erp/types";
import type { Product } from "../../domain/catalog/Product";

/** Mapea la entidad de dominio al contrato compartido (@erp/types): fechas → ISO. */
export function toProductDto(p: Product): ProductDto {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    supplierId: p.supplierId,
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
    deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
  };
}
