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
  parseAmount,
  normalizeRefundStatus,
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

  // ── Productos (borrar stock antes por FK) ────────────────────────────────
  const products = legacy
    .prepare("SELECT id, sku, name, description, price, category, supplier_id, created_at, updated_at, deleted_at FROM products")
    .all() as Array<Record<string, unknown>>;

  await prisma.inventoryStock.deleteMany();
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

  // ── Proveedores ────────────────────────────────────────────────────────────
  const legacySuppliers = legacy
    .prepare("SELECT id, name, contact, country FROM suppliers")
    .all() as Array<Record<string, unknown>>;

  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.supplier.deleteMany();
  for (const s of legacySuppliers) {
    await prisma.supplier.create({
      data: {
        id: Number(s.id),
        name: String(s.name),
        contact: s.contact == null ? null : String(s.contact),
        country: s.country == null ? null : String(s.country),
      },
    });
  }

  // ── Ventas ─────────────────────────────────────────────────────────────────
  const legacySales = legacy
    .prepare("SELECT id, user_id, customer_type, subtotal, total, status, created_at FROM sales")
    .all() as Array<Record<string, unknown>>;

  for (const s of legacySales) {
    await prisma.sale.create({
      data: {
        id: Number(s.id),
        userId: s.user_id == null ? null : Number(s.user_id),
        customerType: s.customer_type == null ? null : String(s.customer_type),
        subtotal: s.subtotal == null ? null : Number(s.subtotal),
        total: s.total == null ? null : String(s.total),
        status: s.status == null ? null : String(s.status),
        createdAt: s.created_at == null ? null : String(s.created_at),
      },
    });
  }

  // ── Items de venta ─────────────────────────────────────────────────────────
  const legacySaleItems = legacy
    .prepare("SELECT id, sale_id, product_id, qty, unit_price FROM sale_items")
    .all() as Array<Record<string, unknown>>;

  for (const si of legacySaleItems) {
    await prisma.saleItem.create({
      data: {
        id: Number(si.id),
        saleId: Number(si.sale_id),
        productId: Number(si.product_id),
        qty: Number(si.qty),
        unitPrice: si.unit_price == null ? null : Number(si.unit_price),
      },
    });
  }

  // ── Estatus de devoluciones (catálogo) ────────────────────────────────────
  const REFUND_STATUSES = [
    { code: "pending",  labelEs: "Pendiente" },
    { code: "approved", labelEs: "Aprobada" },
    { code: "rejected", labelEs: "Rechazada" },
    { code: "done",     labelEs: "Completada" },
  ];

  const legacyRefunds = legacy
    .prepare("SELECT id, sale_id, user_id, reason, amount, status, approved_by, created_at FROM refunds")
    .all() as Array<Record<string, unknown>>;

  await prisma.refund.deleteMany();
  await prisma.refundStatus.deleteMany();
  for (const s of REFUND_STATUSES) await prisma.refundStatus.create({ data: s });

  for (const r of legacyRefunds) {
    await prisma.refund.create({
      data: {
        saleId: r.sale_id == null ? null : Number(r.sale_id),
        userId: r.user_id == null ? null : Number(r.user_id),
        reason: r.reason == null ? null : String(r.reason),
        amount: parseAmount(r.amount),
        status: { connect: { code: normalizeRefundStatus(r.status) } },
        approvedBy: r.approved_by == null ? null : Number(r.approved_by),
        createdAt: parseMixedDate(r.created_at),
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
    `${legacyStock.length} stock rows, ${legacySuppliers.length} suppliers, ` +
    `${legacySales.length} sales, ${legacySaleItems.length} sale_items, ` +
    `${REFUND_STATUSES.length} refund statuses, ${legacyRefunds.length} refunds, ` +
    `${NOTIFICATION_KINDS.length} notification kinds, ${notifications.length} notifications`,
  );
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
