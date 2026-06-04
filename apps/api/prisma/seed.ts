import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";
import {
  parseIsoDate,
  parseMixedDate,
  isRead,
  normalizeKind,
} from "./etl-helpers";
import { encryptPassword } from "../src/infrastructure/crypto/passwordCipher";

/**
 * ETL: carga el seed legacy INMUTABLE en una BD SQLite en memoria y mapea los datos
 * al esquema normalizado nuevo. No modifica el seed ni la BD legacy.
 */

const here = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const ROLES = [
  { id: 1, code: "admin",  labelEs: "Administrador" },
  { id: 2, code: "normal", labelEs: "Usuario" },
];

/** Tabla catálogo de tipos de notificación. */
const NOTIFICATION_KINDS = [
  { id: 1, code: "info",      labelEs: "Información" },
  { id: 2, code: "warn",      labelEs: "Advertencia" },
  { id: 3, code: "alert",     labelEs: "Alerta" },
  { id: 4, code: "system",    labelEs: "Sistema" },
  { id: 5, code: "marketing", labelEs: "Marketing" },
];

async function main(): Promise<void> {
  const sql = readFileSync(join(here, "legacy", "seed_data.sql"), "utf8");
  const legacy = new DatabaseSync(":memory:");
  legacy.exec(sql);

  // ── Roles ─────────────────────────────────────────────────────────────────
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  for (const r of ROLES) await prisma.role.create({ data: r });

  // ── Usuarios con contraseñas cifradas ─────────────────────────────────────
  const legacyUsers = legacy
    .prepare("SELECT id, username, password, is_admin FROM users")
    .all() as Array<Record<string, unknown>>;

  for (const u of legacyUsers) {
    await prisma.user.create({
      data: {
        id: Number(u.id),
        username: String(u.username),
        encryptedPassword: encryptPassword(String(u.password)),
        roleId: Number(u.is_admin) === 1 ? 1 : 2,
      },
    });
  }

  // ── Productos ─────────────────────────────────────────────────────────────
  const products = legacy
    .prepare("SELECT id, sku, name, description, price, category, supplier_id, created_at, updated_at, deleted_at FROM products")
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

  // ── Almacenes ─────────────────────────────────────────────────────────────
  const legacyWarehouses = legacy
    .prepare("SELECT id, name, region FROM warehouses")
    .all() as Array<Record<string, unknown>>;

  await prisma.inventoryStock.deleteMany();
  await prisma.warehouse.deleteMany();
  for (const w of legacyWarehouses) {
    await prisma.warehouse.create({
      data: {
        id: Number(w.id),
        name: String(w.name),
        region: w.region == null ? null : String(w.region),
      },
    });
  }

  // ── Stock de inventario (PK compuesta: productId + warehouseId) ───────────
  const legacyStock = legacy
    .prepare("SELECT product_id, warehouse_id, quantity FROM inventory_stock")
    .all() as Array<Record<string, unknown>>;

  for (const s of legacyStock) {
    await prisma.inventoryStock.create({
      data: {
        productId: Number(s.product_id),
        warehouseId: Number(s.warehouse_id),
        quantity: Number(s.quantity),
      },
    });
  }

  // ── Tipos de notificación (catálogo) ──────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.notificationKind.deleteMany();
  for (const k of NOTIFICATION_KINDS) await prisma.notificationKind.create({ data: k });

  // ── Notificaciones ────────────────────────────────────────────────────────
  const notifications = legacy
    .prepare("SELECT id, user_id, message, kind, status, created_at FROM notifications")
    .all() as Array<Record<string, unknown>>;
  legacy.close();

  for (const r of notifications) {
    const code = normalizeKind(r.kind);
    await prisma.notification.create({
      data: {
        userId: Number(r.user_id),
        message: r.message === null ? null : String(r.message),
        kind: { connect: { code } },   // FK por código canónico
        read: isRead(r.status),
        createdAt: parseMixedDate(r.created_at),
      },
    });
  }

  console.log(
    `Seeded: ${ROLES.length} roles, ${legacyUsers.length} users, ` +
    `${products.length} products, ${legacyWarehouses.length} warehouses, ` +
    `${legacyStock.length} stock rows, ${NOTIFICATION_KINDS.length} notification kinds, ` +
    `${notifications.length} notifications`,
  );
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
