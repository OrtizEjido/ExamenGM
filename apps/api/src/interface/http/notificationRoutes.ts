import { Router } from "express";
import type { AppServices } from "../../infrastructure/di/container";
import { asyncHandler } from "./asyncHandler";
import { toNotificationDto } from "./mappers";

/** INTERFAZ — rutas HTTP de notificaciones. */
export function createNotificationRouter(services: AppServices): Router {
  const router = Router();

  // GET /api/notifications/:userId
  router.get(
    "/:userId",
    asyncHandler(async (req, res) => {
      const userId = Number(req.params.userId);
      if (!Number.isInteger(userId)) {
        res.status(400).json({ error: "invalid userId" });
        return;
      }
      const items = await services.listNotifications.execute(userId);
      res.json(items.map(toNotificationDto));
    }),
  );

  // POST /api/notifications/:id/read
  router.post(
    "/:id/read",
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
      }
      const updated = await services.markNotificationRead.execute(id);
      if (!updated) {
        res.status(404).json({ error: "not found" });
        return;
      }
      res.json(toNotificationDto(updated));
    }),
  );

  // POST /api/notifications
  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const body = req.body ?? {};
      const userId = Number(body.userId);
      if (!Number.isInteger(userId) || !body.message) {
        res.status(400).json({ error: "userId and message are required" });
        return;
      }
      const created = await services.createNotification.execute({
        userId,
        message: String(body.message),
        kind: body.kind ? String(body.kind) : undefined,
      });
      res.status(201).json(toNotificationDto(created));
    }),
  );

  // DELETE /api/notifications/:id
  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
      }
      await services.deleteNotification.execute(id);
      res.json({ id, deleted: true });
    }),
  );

  return router;
}
