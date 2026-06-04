import type { Refund as RefundDto } from "@erp/types";
import type { RefundRepository } from "@/application/refunds/RefundRepository";
import type { Refund, RefundStatusCode } from "@/domain/refunds/Refund";
import { apiGet } from "../http/apiClient";

function toDomain(d: RefundDto): Refund {
  return {
    id: d.id, saleId: d.saleId, userId: d.userId, reason: d.reason,
    amount: d.amount, status: d.status, approvedBy: d.approvedBy, createdAt: d.createdAt,
  };
}

export class HttpRefundRepository implements RefundRepository {
  async listAll(): Promise<Refund[]> {
    return (await apiGet<RefundDto[]>("/api/refunds")).map(toDomain);
  }
  async listByUser(userId: number): Promise<Refund[]> {
    return (await apiGet<RefundDto[]>(`/api/refunds/by-user/${userId}`)).map(toDomain);
  }
  async listByStatus(status: RefundStatusCode): Promise<Refund[]> {
    return (await apiGet<RefundDto[]>(`/api/refunds/search/status?q=${status}`)).map(toDomain);
  }
}
