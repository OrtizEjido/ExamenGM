import type { Prisma, PrismaClient } from "@prisma/client";
import type { InventoryItem, Warehouse } from "../../domain/inventory/InventoryItem";
import type {
  InventoryRepository,
  PageParams,
  PageResult,
} from "../../application/inventory/InventoryRepository";

type StockRow = Prisma.InventoryStockGetPayload<{
  include: { product: true; warehouse: true };
}>;

function toDomain(row: StockRow): InventoryItem {
  return {
    productId: row.productId,
    sku: row.product.sku,
    productName: row.product.name,
    warehouseId: row.warehouseId,
    warehouseName: row.warehouse.name,
    warehouseRegion: row.warehouse.region,
    quantity: row.quantity,
  };
}

function toPage(
  items: InventoryItem[],
  total: number,
  { page, limit }: PageParams,
): PageResult<InventoryItem> {
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

const INCLUDE = { product: true, warehouse: true } as const;

/** INFRAESTRUCTURA — Adapter Prisma del puerto InventoryRepository. */
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listPaginated({ page, limit }: PageParams): Promise<PageResult<InventoryItem>> {
    const skip = (page - 1) * limit;
    const where: Prisma.InventoryStockWhereInput = {
      product: { deletedAt: null },
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.inventoryStock.findMany({
        where, skip, take: limit,
        include: INCLUDE,
        orderBy: [{ product: { sku: "asc" } }, { warehouseId: "asc" }],
      }),
      this.prisma.inventoryStock.count({ where }),
    ]);
    return toPage(rows.map(toDomain), total, { page, limit });
  }

  async listByWarehouse(
    warehouseId: number,
    { page, limit }: PageParams,
  ): Promise<PageResult<InventoryItem>> {
    const skip = (page - 1) * limit;
    const where: Prisma.InventoryStockWhereInput = {
      warehouseId,
      product: { deletedAt: null },
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.inventoryStock.findMany({
        where, skip, take: limit,
        include: INCLUDE,
        orderBy: { product: { sku: "asc" } },
      }),
      this.prisma.inventoryStock.count({ where }),
    ]);
    return toPage(rows.map(toDomain), total, { page, limit });
  }

  async searchByProductName(
    query: string,
    { page, limit }: PageParams,
  ): Promise<PageResult<InventoryItem>> {
    const skip = (page - 1) * limit;
    const where: Prisma.InventoryStockWhereInput = {
      product: { deletedAt: null, name: { contains: query } },
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.inventoryStock.findMany({
        where, skip, take: limit,
        include: INCLUDE,
        orderBy: [{ product: { sku: "asc" } }, { warehouseId: "asc" }],
      }),
      this.prisma.inventoryStock.count({ where }),
    ]);
    return toPage(rows.map(toDomain), total, { page, limit });
  }

  async listWarehouses(): Promise<Warehouse[]> {
    const rows = await this.prisma.warehouse.findMany({ orderBy: { id: "asc" } });
    return rows.map((w) => ({ id: w.id, name: w.name, region: w.region }));
  }
}
