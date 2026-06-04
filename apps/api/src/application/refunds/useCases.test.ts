import { describe, it, expect, vi } from "vitest";
import {
  ListRefunds, GetRefund, ListRefundsByUser, ListRefundsByStatus,
  CreateRefund, ApproveRefund, RejectRefund,
} from "./useCases";
import type { RefundRepository } from "./RefundRepository";
import type { Refund } from "../../domain/refunds/Refund";

const NOW = new Date("2025-06-01T00:00:00.000Z");

const makeRefund = (o?: Partial<Refund>): Refund => ({
  id: 1, saleId: 10, userId: 2, reason: "Producto defectuoso",
  amount: 999.99, status: "pending", approvedBy: null, createdAt: NOW, ...o,
});

const makeRepo = (): RefundRepository => ({
  listAll: vi.fn(), findById: vi.fn(), listByUser: vi.fn(),
  listByStatus: vi.fn(), create: vi.fn(), updateStatus: vi.fn(),
});

describe("ListRefunds", () => {
  it("retorna todos los reembolsos", async () => {
    const repo = makeRepo();
    vi.mocked(repo.listAll).mockResolvedValue([makeRefund(), makeRefund({ id: 2 })]);
    const result = await new ListRefunds(repo).execute();
    expect(result).toHaveLength(2);
  });
});

describe("GetRefund", () => {
  it("retorna el reembolso cuando existe", async () => {
    const repo = makeRepo();
    vi.mocked(repo.findById).mockResolvedValue(makeRefund());
    expect(await new GetRefund(repo).execute(1)).toBeDefined();
    expect(repo.findById).toHaveBeenCalledWith(1);
  });
  it("retorna null cuando no existe", async () => {
    const repo = makeRepo();
    vi.mocked(repo.findById).mockResolvedValue(null);
    expect(await new GetRefund(repo).execute(999)).toBeNull();
  });
});

describe("ListRefundsByUser", () => {
  it("delega con el userId correcto", async () => {
    const repo = makeRepo();
    vi.mocked(repo.listByUser).mockResolvedValue([makeRefund({ userId: 3 })]);
    const result = await new ListRefundsByUser(repo).execute(3);
    expect(result[0]?.userId).toBe(3);
    expect(repo.listByUser).toHaveBeenCalledWith(3);
  });
});

describe("ListRefundsByStatus", () => {
  it("delega con el statusCode correcto", async () => {
    const repo = makeRepo();
    vi.mocked(repo.listByStatus).mockResolvedValue([makeRefund({ status: "approved" })]);
    const result = await new ListRefundsByStatus(repo).execute("approved");
    expect(result[0]?.status).toBe("approved");
    expect(repo.listByStatus).toHaveBeenCalledWith("approved");
  });
});

describe("CreateRefund", () => {
  it("crea con status pending por defecto", async () => {
    const repo = makeRepo();
    vi.mocked(repo.create).mockResolvedValue(makeRefund({ status: "pending" }));
    const result = await new CreateRefund(repo).execute({ saleId: 5, userId: 1, reason: "test", amount: 100 });
    expect(result.status).toBe("pending");
  });
});

describe("ApproveRefund", () => {
  it("llama updateStatus con approved y approvedBy", async () => {
    const repo = makeRepo();
    vi.mocked(repo.updateStatus).mockResolvedValue(makeRefund({ status: "approved", approvedBy: 1 }));
    const result = await new ApproveRefund(repo).execute(1, 1);
    expect(result?.status).toBe("approved");
    expect(repo.updateStatus).toHaveBeenCalledWith(1, "approved", 1);
  });
});

describe("RejectRefund", () => {
  it("llama updateStatus con rejected", async () => {
    const repo = makeRepo();
    vi.mocked(repo.updateStatus).mockResolvedValue(makeRefund({ status: "rejected" }));
    await new RejectRefund(repo).execute(1);
    expect(repo.updateStatus).toHaveBeenCalledWith(1, "rejected");
  });
});
