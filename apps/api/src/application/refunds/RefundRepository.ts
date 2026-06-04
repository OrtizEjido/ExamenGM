import type { Refund, RefundStatusCode } from "../../domain/refunds/Refund";
export type { RefundStatusCode };

export interface CreateRefundData {
  saleId: number;
  userId: number;
  reason: string;
  amount: number;
}

/** APLICACIÓN — Puerto del repositorio de devoluciones. */
export interface RefundRepository {
  listAll(): Promise<Refund[]>;
  findById(id: number): Promise<Refund | null>;
  listByUser(userId: number): Promise<Refund[]>;
  listByStatus(statusCode: RefundStatusCode): Promise<Refund[]>;
  create(input: CreateRefundData): Promise<Refund>;
  updateStatus(id: number, statusCode: RefundStatusCode, approvedBy?: number): Promise<Refund | null>;
}
