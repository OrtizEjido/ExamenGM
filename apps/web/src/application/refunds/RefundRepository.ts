import type { Refund, RefundStatusCode } from "@/domain/refunds/Refund";

export interface RefundRepository {
  listAll(): Promise<Refund[]>;
  listByUser(userId: number): Promise<Refund[]>;
  listByStatus(status: RefundStatusCode): Promise<Refund[]>;
}
