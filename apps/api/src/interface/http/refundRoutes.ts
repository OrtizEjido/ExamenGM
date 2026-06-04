import { Router } from "express";
import type { RefundStatusCode } from "../../domain/refunds/Refund";
import type { AppServices } from "../../infrastructure/di/container";
import { asyncHandler } from "./asyncHandler";
import { toRefundDto } from "./mappers";

const VALID_STATUS: RefundStatusCode[] = ["pending", "approved", "rejected", "done"];

export function createRefundRouter(services: AppServices): Router {
  const router = Router();

  // GET /api/refunds
  router.get("/", asyncHandler(async (_req, res) => {
    const items = await services.listRefunds.execute();
    res.json(items.map(toRefundDto));
  }));

  // GET /api/refunds/search/status?q=pending
  router.get("/search/status", asyncHandler(async (req, res) => {
    const q = (typeof req.query.q === "string" ? req.query.q : "").toLowerCase() as RefundStatusCode;
    if (!VALID_STATUS.includes(q)) {
      res.status(400).json({ error: `status must be one of: ${VALID_STATUS.join(", ")}` });
      return;
    }
    const items = await services.listRefundsByStatus.execute(q);
    res.json(items.map(toRefundDto));
  }));

  // GET /api/refunds/by-user/:uid
  router.get("/by-user/:uid", asyncHandler(async (req, res) => {
    const uid = Number(req.params.uid);
    if (!Number.isInteger(uid)) { res.status(400).json({ error: "invalid userId" }); return; }
    const items = await services.listRefundsByUser.execute(uid);
    res.json(items.map(toRefundDto));
  }));

  // GET /api/refunds/:id
  router.get("/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }
    const item = await services.getRefund.execute(id);
    if (!item) { res.status(404).json({ error: "not found" }); return; }
    res.json(toRefundDto(item));
  }));

  // POST /api/refunds
  router.post("/", asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    if (!body.saleId || !body.userId || !body.reason || body.amount == null) {
      res.status(400).json({ error: "saleId, userId, reason y amount son requeridos" });
      return;
    }
    const created = await services.createRefund.execute({
      saleId: Number(body.saleId),
      userId: Number(body.userId),
      reason: String(body.reason),
      amount: Number(body.amount),
    });
    res.status(201).json(toRefundDto(created));
  }));

  // POST /api/refunds/:id/approve
  router.post("/:id/approve", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const approvedBy = Number(req.body?.approvedBy ?? 0);
    if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }
    const updated = await services.approveRefund.execute(id, approvedBy);
    if (!updated) { res.status(404).json({ error: "not found" }); return; }
    res.json(toRefundDto(updated));
  }));

  // POST /api/refunds/:id/reject
  router.post("/:id/reject", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }
    const updated = await services.rejectRefund.execute(id);
    if (!updated) { res.status(404).json({ error: "not found" }); return; }
    res.json(toRefundDto(updated));
  }));

  return router;
}
