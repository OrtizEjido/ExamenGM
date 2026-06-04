import type { Session } from "@/domain/auth/Session";
import type { AuthRepository, LoginInput } from "@/application/auth/AuthRepository";
import { apiPost } from "../http/apiClient";

interface LoginResponse {
  token: string;
  user: { id: number; username: string; role: "admin" | "normal" };
}

/** INFRAESTRUCTURA — Adapter HTTP del puerto de autenticación. */
export class HttpAuthRepository implements AuthRepository {
  async login(input: LoginInput): Promise<Session> {
    const res = await apiPost<LoginResponse>("/api/auth/login", input);
    return { token: res.token, user: res.user };
  }
}
