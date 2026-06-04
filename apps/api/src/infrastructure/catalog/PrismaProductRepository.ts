import type { Prisma, PrismaClient } from "@prisma/client";
import type { Product } from "../../domain/catalog/Product";
import type {
  CreateProductData,
  PageParams,
  PageResult,
  ProductRepository,
} from "../../application/catalog/ProductRepository";

type ProductRow = Prisma.ProductGetPayload<Record<string, never>>;

function toDomain(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    supplierId: row.supplierId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

function toPageResult(
  items: Product[],
  total: number,
  { page, limit }: PageParams,
): PageResult<Product> {
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

/**
 * Normaliza la búsqueda por SKU: extrae los dígitos y los rellena con ceros a
 * la izquierda hasta 5 (p.ej. "14" → "00014"). Si no hay dígitos, usa el
 * string tal cual.
 */
function normalizeSkuQuery(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return input;
  return digits.length >= 5 ? digits : digits.padStart(5, "0");
}

/** INFRAESTRUCTURA — Adapter Prisma del puerto ProductRepository. */
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listPaginated({ page, limit }: PageParams): Promise<PageResult<Product>> {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, skip, take: limit, orderBy: { id: "asc" } }),
      this.prisma.product.count({ where }),
    ]);
    return toPageResult(rows.map(toDomain), total, { page, limit });
  }

  async findById(id: number): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({ where: { id, deletedAt: null } });
    return row ? toDomain(row) : null;
  }

  async searchByName(query: string, { page, limit }: PageParams): Promise<PageResult<Product>> {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      name: { contains: query },
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, skip, take: limit, orderBy: { id: "asc" } }),
      this.prisma.product.count({ where }),
    ]);
    return toPageResult(rows.map(toDomain), total, { page, limit });
  }

  async searchBySku(rawQuery: string, { page, limit }: PageParams): Promise<PageResult<Product>> {
    const skip = (page - 1) * limit;
    const q = normalizeSkuQuery(rawQuery);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      sku: { contains: q },
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, skip, take: limit, orderBy: { id: "asc" } }),
      this.prisma.product.count({ where }),
    ]);
    return toPageResult(rows.map(toDomain), total, { page, limit });
  }

  async create(input: CreateProductData): Promise<Product> {
    const now = new Date();
    const row = await this.prisma.product.create({
      data: {
        sku: input.sku,
        name: input.name,
        price: input.price,
        category: input.category,
        supplierId: input.supplierId,
        description: input.description ?? null,
        createdAt: now,
        updatedAt: now,
      },
    });
    return toDomain(row);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
