import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { createContainer } from "./infrastructure/di/container";
import { healthRouter } from "./interface/http/healthRoutes";
import { createCatalogRouter } from "./interface/http/catalogRoutes";
import { createNotificationRouter } from "./interface/http/notificationRoutes";

const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors());
app.use(express.json());

const services = createContainer();
app.use("/api", healthRouter());
app.use("/api/products", createCatalogRouter(services));
app.use("/api/notifications", createNotificationRouter(services));

// Middleware de error final.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
