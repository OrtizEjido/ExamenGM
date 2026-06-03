/** Bounded context: Identity (usuarios / autenticación). */
import type { Id, IntBool, ErrorResponse } from "../common";

// --- Entidad: fila de la tabla `users` ---
export interface UserRow {
  id: Id;
  username: string;
  /** LEGACY: contraseña en texto plano. */
  password: string;
  is_admin: IntBool;
}

/** Vista pública devuelta por el login (POST /api/login). */
export interface UserPublic {
  user_id: Id;
  username: string;
  is_admin: boolean;
}

/** Fila devuelta por GET /api/users (`SELECT id, username, is_admin`). */
export interface UserListItem {
  id: Id;
  username: string;
  is_admin: IntBool;
}

// --- API ---

/** POST /api/login */
export interface LoginRequest {
  username: string;
  password: string;
}
export type LoginResponse = UserPublic | ErrorResponse;
