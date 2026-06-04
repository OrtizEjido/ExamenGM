import type { Refund, RefundStatusCode } from "@/domain/refunds/Refund";
import type { RefundRepository } from "./RefundRepository";

export class ListRefunds {
  constructor(private readonly repo: RefundRepository) {}
  execute(): Promise<Refund[]> { return this.repo.listAll(); }
}
export class ListRefundsByStatus {
  constructor(private readonly repo: RefundRepository) {}
  execute(status: RefundStatusCode): Promise<Refund[]> { return this.repo.listByStatus(status); }
}
