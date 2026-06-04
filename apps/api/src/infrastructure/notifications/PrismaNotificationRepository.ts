import type { PrismaClient } from "@prisma/client";
import type { Notification } from "../../domain/notifications/Notification";
import type {
  CreateNotificationData,
  NotificationRepository,
} from "../../application/notifications/NotificationRepository";

const VALID_KINDS = ["info", "warn", "alert", "system", "marketing"];

interface NotificationRow {
  id: number;
  userId: number;
  message: string | null;
  kind: string | null;
  read: boolean;
  createdAt: Date | null;
}

function toDomain(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.userId,
    message: row.message,
    kind: row.kind,
    read: row.read,
    createdAt: row.createdAt,
  };
}

function normalizeKind(kind: string | undefined): string {
  const k = (kind ?? "").toLowerCase();
  return VALID_KINDS.includes(k) ? k : "info";
}

/** INFRAESTRUCTURA — Adapter Prisma del puerto NotificationRepository. */
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listForUser(userId: number): Promise<Notification[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
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
    const row = await this.prisma.notification.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(input: CreateNotificationData): Promise<Notification> {
    const row = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        message: input.message,
        kind: normalizeKind(input.kind),
        read: false,
        createdAt: new Date(),
      },
    });
    return toDomain(row);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.notification.deleteMany({ where: { id } });
  }
}
