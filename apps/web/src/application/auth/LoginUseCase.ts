import type { Session } from "@/domain/auth/Session";
import type { AuthRepository, LoginInput } from "./AuthRepository";

/** CASO DE USO — Login del frontend. */
export class LoginUseCase {
  constructor(private readonly repo: AuthRepository) {}
  execute(input: LoginInput): Promise<Session> {
    return this.repo.login(input);
  }
}
