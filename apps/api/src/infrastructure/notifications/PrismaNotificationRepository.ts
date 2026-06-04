import type { Prisma, PrismaClient } from "@prisma/client";
import type { Notification } from "../../domain/notifications/Notification";
import type {
  CreateNotificationData,
  NotificationRepository,
} from "../../application/notifications/NotificationRepository";

/** Tipo Prisma con el join de notificationKind incluido. */
type NotificationRow = Prisma.NotificationGetPayload<{
  include: { kind: true };
}>;

/**
 * Mapea la fila Prisma (con join) al modelo de dominio.
 * El dominio sigue exponiendo `kind` como código string — el FK es un
 * detalle de infraestructura invisible fuera del repositorio.
 */
function toDomain(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.userId,
    message: row.message,
    kind: row.kind?.code ?? null,   // código canónico, no el id
    read: row.read,
    createdAt: row.createdAt,
  };
}

const VALID_KIND_CODES = ["info", "warn", "alert", "system", "marketing"];

function normalizeKindCode(code: string | undefined): string {
  const k = (code ?? "").toLowerCase();
  return VALID_KIND_CODES.includes(k) ? k : "info";
}

/** INFRAESTRUCTURA — Adapter Prisma del puerto NotificationRepository. */
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listForUser(userId: number): Promise<Notification[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      include: { kind: true },
      orderBy: { id: "desc" },
    });
    return rows.map(toDomain);
  }

  async markRead(id: number): Promise<Notification | null> {
    const updated = await this.prisma.notification.updateMany({
      where: { id },
      data: { read: true },
    });
    if (updated.count === 0) return null;
    const row = await this.prisma.notification.findUnique({
      where: { id },
      include: { kind: true },
    });
    return row ? toDomain(row) : null;
  }

  async create(input: CreateNotificationData): Promise<Notification> {
    const code = normalizeKindCode(input.kind);
    const row = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        message: input.message,
        kind: { connect: { code } },
        read: false,
        createdAt: new Date(),
      },
      include: { kind: true },
    });
    return toDomain(row);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.notification.deleteMany({ where: { id } });
  }
}
