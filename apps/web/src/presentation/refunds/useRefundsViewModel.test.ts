import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRefundsViewModel } from "./useRefundsViewModel";
import type { Refund } from "@/domain/refunds/Refund";

const { mockList, mockByStatus, stableServices } = vi.hoisted(() => {
  const mockList     = vi.fn<() => Promise<Refund[]>>();
  const mockByStatus = vi.fn<() => Promise<Refund[]>>();
  const stableServices = {
    listRefunds: { execute: mockList },
    listRefundsByStatus: { execute: mockByStatus },
  };
  return { mockList, mockByStatus, stableServices };
});

vi.mock("@/presentation/di/ServicesProvider", () => ({ useServices: () => stableServices }));

const makeRefund = (o?: Partial<Refund>): Refund => ({
  id: 1, saleId: 10, userId: 2, reason: "Test",
  amount: 99.9, status: "pending", approvedBy: null, createdAt: null, ...o,
});

beforeEach(() => { vi.clearAllMocks(); });

describe("useRefundsViewModel", () => {
  it("carga todos los reembolsos en ready", async () => {
    mockList.mockResolvedValue([makeRefund(), makeRefund({ id: 2, status: "approved" })]);
    const { result } = renderHook(() => useRefundsViewModel());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.refunds).toHaveLength(2);
    expect(result.current.filterMode).toBe("all");
  });

  it("pasa a error si el repositorio falla", async () => {
    mockList.mockRejectedValue(new Error("HTTP 503"));
    const { result } = renderHook(() => useRefundsViewModel());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("HTTP 503");
  });

  it("filterByStatus llama al endpoint de búsqueda por estado", async () => {
    mockList.mockResolvedValue([makeRefund()]);
    mockByStatus.mockResolvedValue([makeRefund({ status: "approved" })]);
    const { result } = renderHook(() => useRefundsViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.filterByStatus("approved"));
    await waitFor(() => expect(result.current.filterMode).toBe("status"));
    expect(result.current.refunds[0]?.status).toBe("approved");
    expect(mockByStatus).toHaveBeenCalledWith("approved");
  });

  it("clearFilter vuelve a modo all", async () => {
    mockList.mockResolvedValue([makeRefund()]);
    mockByStatus.mockResolvedValue([makeRefund({ status: "rejected" })]);
    const { result } = renderHook(() => useRefundsViewModel());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.filterByStatus("rejected"));
    await waitFor(() => expect(result.current.filterMode).toBe("status"));

    act(() => result.current.clearFilter());
    await waitFor(() => expect(result.current.filterMode).toBe("all"));
    expect(mockList).toHaveBeenCalledTimes(2);
  });
});
