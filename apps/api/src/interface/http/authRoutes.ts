import { Router } from "express";
import type { AppServices } from "../../infrastructure/di/container";
import { asyncHandler } from "./asyncHandler";

/** INTERFAZ — rutas de autenticación. */
export function createAuthRouter(services: AppServices): Router {
  const router = Router();

  // POST /api/auth/login
  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const { username, password } = req.body ?? {};
      if (!username || !password) {
        res.status(400).json({ error: "username y password son requeridos" });
        return;
      }

      const result = await services.login.execute({
        username: String(username),
        password: String(password),
      });

      if (!result) {
        res.status(401).json({ error: "Credenciales incorrectas" });
        return;
      }

      res.json({
        token: result.token,
        user: {
          id: result.user.id,
          username: result.user.username,
          role: result.user.roleCode,
        },
      });
    }),
  );

  return router;
}
