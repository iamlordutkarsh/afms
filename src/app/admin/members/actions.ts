"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { memberCreateSchema, memberUpdateSchema, type ActionResult } from "@/lib/validation";
import { randomPassword, hashPassword, comparePassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";

/** Create a member with a random temp password (returned to show once). */
export async function createMember(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const parsed = memberCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const { email, name, phone, role, address } = parsed.data;
  if (await prisma.member.findUnique({ where: { email } }))
    return { ok: false, error: "A member with that email already exists." };

  const tempPassword = randomPassword();
  const member = await prisma.member.create({
    data: { email, name, phone, role, address, passwordHash: await hashPassword(tempPassword) },
  });
  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Member", entityId: member.id, after: member });
  revalidatePath("/admin/members");
  return { ok: true, tempPassword, name };
}

/** Update a member's profile / role / active state. */
export async function updateMember(id: string, _prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const raw = Object.fromEntries(formData);
  const data = { ...raw, isActive: raw.isActive === "on" || raw.isActive === "true" };
  const parsed = memberUpdateSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const before = await prisma.member.findUnique({ where: { id } });
  // Lockout guard: never demote the last active Super Admin.
  if (before?.role === "SUPER_ADMIN" && parsed.data.role && parsed.data.role !== "SUPER_ADMIN") {
    const superCount = await prisma.member.count({ where: { role: "SUPER_ADMIN", isActive: true } });
    if (superCount <= 1) return { ok: false, error: "Cannot demote the last Super Admin." };
  }

  const member = await prisma.member.update({ where: { id }, data: parsed.data });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Member", entityId: id, before, after: member });
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
  return { ok: true };
}

/** Generate a new temp password for a member (admin-driven reset). */
export async function resetPassword(id: string): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const tempPassword = randomPassword();
  await prisma.member.update({ where: { id }, data: { passwordHash: await hashPassword(tempPassword) } });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Member", entityId: id, after: { passwordReset: true } });
  return { ok: true, tempPassword };
}

/** Member updates their own phone/address (no role or email change). */
export async function updateOwnProfile(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  if (phone.length < 4) return { ok: false, error: "Phone number is required" };
  const before = await prisma.member.findUnique({ where: { id: session.user.id } });
  const member = await prisma.member.update({
    where: { id: session.user.id },
    data: { phone, address: address || undefined },
  });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Member", entityId: session.user.id, before, after: member });
  revalidatePath("/member/profile");
  return { ok: true };
}

/** Member changes their own password (verifies current, sets new). */
export async function changeOwnPassword(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };
  const current = String(formData.get("currentPassword") || "");
  const next = String(formData.get("newPassword") || "");
  if (next.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
  const member = await prisma.member.findUnique({ where: { id: session.user.id } });
  if (!member) return { ok: false, error: "Account not found." };
  const valid = await comparePassword(current, member.passwordHash);
  if (!valid) return { ok: false, error: "Current password is incorrect." };
  await prisma.member.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(next) },
  });
  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entity: "Member",
    entityId: session.user.id,
    after: { passwordChanged: true },
  });
  return { ok: true };
}
