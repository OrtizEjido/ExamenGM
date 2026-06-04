import jwt from "jsonwebtoken";
import type { User } from "../../domain/auth/User";
import type { AuthRepository } from "./AuthRepository";
import { verifyPassword } from "../../infrastructure/crypto/passwordCipher";

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

function generateToken(user: User): string {
  const secret = process.env.JWT_SECRET ?? "erp-dev-secret-2026";
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.roleCode },
    secret,
    { expiresIn: "8h" },
  );
}

/** CASO DE USO — Login: verifica credenciales y devuelve token JWT. */
export class Login {
  constructor(private readonly repo: AuthRepository) {}

  async execute(input: LoginInput): Promise<LoginResult | null> {
    const found = await this.repo.findByUsername(input.username);
    if (!found) return null;

    const ok = verifyPassword(input.password, found.encryptedPassword);
    if (!ok) return null;

    const user: User = {
      id: found.id,
      username: found.username,
      roleCode: found.roleCode,
    };

    return { user, token: generateToken(user) };
  }
}
