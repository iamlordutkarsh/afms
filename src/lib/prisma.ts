import { PrismaClient } from "@prisma/client";

// Single PrismaClient instance across hot-reloads in dev (avoids exhausting
// SQLite connections/checkpoints during `next dev`).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
