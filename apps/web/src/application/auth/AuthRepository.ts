import type { Session } from "@/domain/auth/Session";

export interface LoginInput {
  username: string;
  password: string;
}

/** Puerto del repositorio de autenticación (frontend). */
export interface AuthRepository {
  login(input: LoginInput): Promise<Session>;
}
