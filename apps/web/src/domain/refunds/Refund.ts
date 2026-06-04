export type RefundStatusCode = "pending" | "approved" | "rejected" | "done";

export interface Refund {
  id: number;
  saleId: number | null;
  userId: number | null;
  reason: string | null;
  amount: number | null;
  status: RefundStatusCode;
  approvedBy: number | null;
  createdAt: string | null;
}
