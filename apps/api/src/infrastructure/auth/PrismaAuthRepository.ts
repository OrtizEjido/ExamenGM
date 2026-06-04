import type { PrismaClient } from "@prisma/client";
import type { UserWithPassword } from "../../domain/auth/User";
import type { AuthRepository } from "../../application/auth/AuthRepository";

/** INFRAESTRUCTURA — Adapter Prisma del puerto de autenticación. */
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUsername(username: string): Promise<UserWithPassword | null> {
    const row = await this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      encryptedPassword: row.encryptedPassword,
      roleCode: row.role.code as "admin" | "normal",
    };
  }
}
