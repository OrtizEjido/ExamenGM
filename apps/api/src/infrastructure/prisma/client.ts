import { PrismaClient } from "@prisma/client";

/** Cliente Prisma único para todo el proceso. */
export const prisma = new PrismaClient();
