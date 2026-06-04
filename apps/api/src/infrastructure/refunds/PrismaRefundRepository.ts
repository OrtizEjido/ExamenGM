import type { Prisma, PrismaClient } from "@prisma/client";
import type { Refund, RefundStatusCode } from "../../domain/refunds/Refund";
import type { CreateRefundData, RefundRepository } from "../../application/refunds/RefundRepository";

type RefundRow = Prisma.RefundGetPayload<{ include: { status: true } }>;

function toDomain(row: RefundRow): Refund {
  return {
    id: row.id,
    saleId: row.saleId,
    userId: row.userId,
    reason: row.reason,
    amount: row.amount,
    status: row.status.code as RefundStatusCode,
    approvedBy: row.approvedBy,
    createdAt: row.createdAt,
  };
}

const INC = { status: true } as const;

export class PrismaRefundRepository implements RefundRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listAll(): Promise<Refund[]> {
    const rows = await this.prisma.refund.findMany({ include: INC, orderBy: { id: "desc" } });
    return rows.map(toDomain);
  }

  async findById(id: number): Promise<Refund | null> {
    const row = await this.prisma.refund.findUnique({ where: { id }, include: INC });
    return row ? toDomain(row) : null;
  }

  async listByUser(userId: number): Promise<Refund[]> {
    const rows = await this.prisma.refund.findMany({
      where: { userId }, include: INC, orderBy: { id: "desc" },
    });
    return rows.map(toDomain);
  }

  async listByStatus(statusCode: RefundStatusCode): Promise<Refund[]> {
    const rows = await this.prisma.refund.findMany({
      where: { statusCode }, include: INC, orderBy: { id: "desc" },
    });
    return rows.map(toDomain);
  }

  async create(input: CreateRefundData): Promise<Refund> {
    const row = await this.prisma.refund.create({
      data: {
        saleId: input.saleId,
        userId: input.userId,
        reason: input.reason,
        amount: input.amount,
        status: { connect: { code: "pending" } },
        createdAt: new Date(),
      },
      include: INC,
    });
    return toDomain(row);
  }

  async updateStatus(id: number, statusCode: RefundStatusCode, approvedBy?: number): Promise<Refund | null> {
    const exists = await this.prisma.refund.findUnique({ where: { id } });
    if (!exists) return null;
    const row = await this.prisma.refund.update({
      where: { id },
      data: {
        status: { connect: { code: statusCode } },
        ...(approvedBy != null ? { approvedBy } : {}),
      },
      include: INC,
    });
    return toDomain(row);
  }
}
