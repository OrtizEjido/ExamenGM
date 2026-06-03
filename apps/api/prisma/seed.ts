import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";

/**
 * ETL: carga el seed legacy INMUTABLE en una BD SQLite en memoria, lee `products`
 * y los importa al esquema normalizado nuevo. No modifica el seed ni la BD legacy.
 */

const here = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function parseLegacyDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

async function main(): Promise<void> {
  const sql = readFileSync(join(here, "legacy", "seed_data.sql"), "utf8");

  const legacy = new DatabaseSync(":memory:");
  legacy.exec(sql);
  const rows = legacy
    .prepare(
      "SELECT id, sku, name, description, price, category, supplier_id, created_at, updated_at, deleted_at FROM products",
    )
    .all() as Array<Record<string, unknown>>;
  legacy.close();

  await prisma.product.deleteMany();

  for (const r of rows) {
    await prisma.product.create({
      data: {
        id: Number(r.id),
        sku: r.sku === null ? null : String(r.sku),
        name: r.name === null ? null : String(r.name),
        description: r.description === null ? null : String(r.description),
        price: r.price === null ? null : Number(r.price),
        category: r.category === null ? null : String(r.category),
        supplierId: r.supplier_id === null ? null : Number(r.supplier_id),
        createdAt: parseLegacyDate(r.created_at),
        updatedAt: parseLegacyDate(r.updated_at),
        deletedAt: parseLegacyDate(r.deleted_at),
      },
    });
  }

  console.log(`Imported ${rows.length} products from legacy seed`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
