import type {
  InventoryItem as InventoryItemDto,
  InventoryPage,
  Notification as NotificationDto,
  Product as ProductDto,
  ProductPage,
  Refund as RefundDto,
  Warehouse as WarehouseDto,
} from "@erp/types";
import type { Product } from "../../domain/catalog/Product";
import type { PageResult } from "../../application/catalog/ProductRepository";
import type { InventoryItem, Warehouse } from "../../domain/inventory/InventoryItem";
import type { Notification } from "../../domain/notifications/Notification";
import type { Refund } from "../../domain/refunds/Refund";

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

/** Mapea un item de inventario al contrato compartido. */
export function toInventoryItemDto(i: InventoryItem): InventoryItemDto {
  return {
    productId: i.productId,
    sku: i.sku,
    productName: i.productName,
    warehouseId: i.warehouseId,
    warehouseName: i.warehouseName,
    warehouseRegion: i.warehouseRegion,
    quantity: i.quantity,
  };
}

/** Mapea una página de inventario al contrato compartido. */
export function toInventoryPageDto(page: PageResult<InventoryItem>): InventoryPage {
  return {
    items: page.items.map(toInventoryItemDto),
    total: page.total,
    page: page.page,
    limit: page.limit,
    pages: page.pages,
  };
}

/** Mapea un almacén al contrato compartido. */
export function toWarehouseDto(w: Warehouse): WarehouseDto {
  return { id: w.id, name: w.name, region: w.region };
}

/** Mapea una devolución al contrato compartido (fecha → ISO, amount numérico). */
export function toRefundDto(r: Refund): RefundDto {
  return {
    id: r.id,
    saleId: r.saleId,
    userId: r.userId,
    reason: r.reason,
    amount: r.amount,
    status: r.status,
    approvedBy: r.approvedBy,
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
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
