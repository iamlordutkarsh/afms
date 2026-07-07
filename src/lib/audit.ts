import { prisma } from "@/lib/prisma";

function redact(obj: unknown) {
  if (obj && typeof obj === "object" && "passwordHash" in obj) {
    const { passwordHash: _omit, ...rest } = obj as Record<string, unknown>;
    return rest;
  }
  return obj;
}

/** Fire-and-forget audit entry. Never throws into the caller's flow. */
export async function logAudit(input: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        before: input.before ? JSON.stringify(redact(input.before)) : undefined,
        after: input.after ? JSON.stringify(redact(input.after)) : undefined,
        ip: input.ip,
      },
    });
  } catch {
    // audit logging must never break the main operation
  }
}
