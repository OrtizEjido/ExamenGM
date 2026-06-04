import type { UserWithPassword } from "../../domain/auth/User";

/** Puerto del repositorio de autenticación. */
export interface AuthRepository {
  findByUsername(username: string): Promise<UserWithPassword | null>;
}
