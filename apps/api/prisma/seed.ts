import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";

/**
 * ETL: carga el seed legacy INMUTABLE en una BD SQLite en memoria y mapea los datos
 * al esquema normalizado nuevo. No modifica el seed ni la BD legacy.
 */

const here = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const VALID_KINDS = ["info", "warn", "alert", "system", "marketing"];

/** Catálogo canónico de estatus de notificación (con etiqueta en español). */
const NOTIFICATION_STATUSES = [
  { code: "unread", labelEs: "No leída" },
  { code: "read", labelEs: "Leída" },
];

/** Fechas ISO simples (productos): 'YYYY-MM-DD'. */
function parseIsoDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fechas legacy mezcladas: ISO, 'DD/MM/YYYY' o epoch unix (segundos). */
function parseMixedDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const s = String(value).trim();
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return new Date(n < 1e12 ? n * 1000 : n);
  }
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00.000Z`);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Unifica el estatus legacy a un code canónico. */
function mapStatus(legacy: unknown): "unread" | "read" {
  return String(legacy ?? "").toLowerCase() === "unread" ? "unread" : "read";
}

function normalizeKind(legacy: unknown): string {
  const k = String(legacy ?? "").toLowerCase();
  return VALID_KINDS.includes(k) ? k : "info";
}

async function main(): Promise<void> {
  const sql = readFileSync(join(here, "legacy", "seed_data.sql"), "utf8");
  const legacy = new DatabaseSync(":memory:");
  legacy.exec(sql);

  // --- Catálogo: productos ---
  const products = legacy
    .prepare(
      "SELECT id, sku, name, description, price, category, supplier_id, created_at, updated_at, deleted_at FROM products",
    )
    .all() as Array<Record<string, unknown>>;

  await prisma.product.deleteMany();
  for (const r of products) {
    await prisma.product.create({
      data: {
        id: Number(r.id),
        sku: r.sku === null ? null : String(r.sku),
        name: r.name === null ? null : String(r.name),
        description: r.description === null ? null : String(r.description),
        price: r.price === null ? null : Number(r.price),
        category: r.category === null ? null : String(r.category),
        supplierId: r.supplier_id === null ? null : Number(r.supplier_id),
        createdAt: parseIsoDate(r.created_at),
        updatedAt: parseIsoDate(r.updated_at),
        deletedAt: parseIsoDate(r.deleted_at),
      },
    });
  }

  // --- Notificaciones (con estatus unificado por catálogo) ---
  const notifications = legacy
    .prepare(
      "SELECT id, user_id, message, kind, status, created_at FROM notifications",
    )
    .all() as Array<Record<string, unknown>>;
  legacy.close();

  await prisma.notification.deleteMany();
  await prisma.notificationStatus.deleteMany();
  for (const s of NOTIFICATION_STATUSES) {
    await prisma.notificationStatus.create({ data: s });
  }

  for (const r of notifications) {
    await prisma.notification.create({
      data: {
        id: Number(r.id),
        userId: Number(r.user_id),
        message: r.message === null ? null : String(r.message),
        kind: normalizeKind(r.kind),
        statusCode: mapStatus(r.status),
        createdAt: parseMixedDate(r.created_at),
      },
    });
  }

  console.log(
    `Imported ${products.length} products and ${notifications.length} notifications`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
