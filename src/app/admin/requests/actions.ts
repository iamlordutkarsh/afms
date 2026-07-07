"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import type { ActionResult } from "@/lib/validation";

/** Approve a request: create a Member with the chosen role + temp password. */
export async function approveRequest(id: string, _prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const role = String(formData.get("role") || "MEMBER");

  try {
    // Atomic: SQLite serializes writes → a double-click's second submit waits
    // for the first transaction, then sees status=APPROVED → "already processed".
    const member = await prisma.$transaction(async (tx) => {
      const req = await tx.registrationRequest.findUnique({ where: { id } });
      if (!req || req.status !== "PENDING")
        throw new Error("Request not found or already processed.");
      const existing = await tx.member.findUnique({ where: { email: req.email } });
      if (existing) throw new Error("A member with this email already exists.");
      const created = await tx.member.create({
        data: {
          email: req.email,
          name: req.name,
          phone: req.phone,
          address: req.address,
          passwordHash: req.passwordHash,
          role,
          isActive: true,
        },
      });
      await tx.registrationRequest.update({
        where: { id },
        data: { status: "APPROVED", assignedRole: role, reviewedById: session.user.id, reviewedAt: new Date() },
      });
      return created;
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entity: "Member",
      entityId: member.id,
      after: { ...member, passwordHash: undefined },
    });
    revalidatePath("/admin/requests");
    revalidatePath("/admin/members");
    return { ok: true, name: member.name };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Approval failed." };
  }
}

/** Reject a request (no member created). */
export async function rejectRequest(id: string): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const req = await prisma.registrationRequest.findUnique({ where: { id } });
  if (!req || req.status !== "PENDING")
    return { ok: false, error: "Request not found or already processed." };
  await prisma.registrationRequest.update({
    where: { id },
    data: { status: "REJECTED", reviewedById: session.user.id, reviewedAt: new Date() },
  });
  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "RegistrationRequest",
    entityId: id,
    after: { status: "REJECTED" },
  });
  revalidatePath("/admin/requests");
  return { ok: true };
}
