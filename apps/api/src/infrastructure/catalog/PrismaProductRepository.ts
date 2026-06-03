import type { PrismaClient } from "@prisma/client";
import type { Product } from "../../domain/catalog/Product";
import type {
  CreateProductData,
  ProductRepository,
} from "../../application/catalog/ProductRepository";

interface ProductRow {
  id: number;
  sku: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  supplierId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

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

/** INFRAESTRUCTURA — Adapter Prisma del puerto ProductRepository. */
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listActive(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
    });
    return rows.map(toDomain);
  }

  async findById(id: number): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? toDomain(row) : null;
  }

  async search(query: string): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: { deletedAt: null, name: { contains: query } },
      orderBy: { id: "asc" },
    });
    return rows.map(toDomain);
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
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
