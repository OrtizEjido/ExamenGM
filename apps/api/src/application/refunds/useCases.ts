import type { Refund, RefundStatusCode } from "../../domain/refunds/Refund";
import type { CreateRefundData, RefundRepository } from "./RefundRepository";

export class ListRefunds {
  constructor(private readonly repo: RefundRepository) {}
  execute(): Promise<Refund[]> { return this.repo.listAll(); }
}

export class GetRefund {
  constructor(private readonly repo: RefundRepository) {}
  execute(id: number): Promise<Refund | null> { return this.repo.findById(id); }
}

export class ListRefundsByUser {
  constructor(private readonly repo: RefundRepository) {}
  execute(userId: number): Promise<Refund[]> { return this.repo.listByUser(userId); }
}

export class ListRefundsByStatus {
  constructor(private readonly repo: RefundRepository) {}
  execute(statusCode: RefundStatusCode): Promise<Refund[]> {
    return this.repo.listByStatus(statusCode);
  }
}

export class CreateRefund {
  constructor(private readonly repo: RefundRepository) {}
  execute(input: CreateRefundData): Promise<Refund> { return this.repo.create(input); }
}

export class ApproveRefund {
  constructor(private readonly repo: RefundRepository) {}
  execute(id: number, approvedBy: number): Promise<Refund | null> {
    return this.repo.updateStatus(id, "approved", approvedBy);
  }
}

export class RejectRefund {
  constructor(private readonly repo: RefundRepository) {}
  execute(id: number): Promise<Refund | null> {
    return this.repo.updateStatus(id, "rejected");
  }
}
