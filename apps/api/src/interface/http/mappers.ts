import type {
  Notification as NotificationDto,
  Product as ProductDto,
  ProductPage,
} from "@erp/types";
import type { Product } from "../../domain/catalog/Product";
import type { PageResult } from "../../application/catalog/ProductRepository";
import type { Notification } from "../../domain/notifications/Notification";

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

/** Mapea una página de productos al contrato compartido. */
export function toProductPageDto(page: PageResult<Product>): ProductPage {
  return {
    items: page.items.map(toProductDto),
    total: page.total,
    page: page.page,
    limit: page.limit,
    pages: page.pages,
  };
}

/** Mapea la notificación de dominio al contrato compartido (fecha → ISO). */
export function toNotificationDto(n: Notification): NotificationDto {
  return {
    id: n.id,
    userId: n.userId,
    message: n.message,
    kind: n.kind,
    read: n.read,
    createdAt: n.createdAt ? n.createdAt.toISOString() : null,
  };
}
