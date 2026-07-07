"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/rbac";
import { nextReceiptNo } from "@/lib/receipts";
import { logAudit } from "@/lib/audit";
import type { ActionResult } from "@/lib/validation";

/** Bulk-create dues for all active members for a category + period. Idempotent via @@unique. */
export async function generateDues(_prev: unknown, formData: FormData): Promise<ActionResult & { created?: number }> {
  const session = requireAdmin(await auth());
  const categoryId = String(formData.get("categoryId") || "");
  const period = String(formData.get("period") || ""); // YYYY-MM
  const amount = Number(formData.get("amount") || 0);
  const note = String(formData.get("note") || "");

  if (!categoryId || !/^\d{4}-\d{2}$/.test(period) || amount <= 0) {
    return { ok: false, error: "Pick a category, a valid period (YYYY-MM), and a positive amount." };
  }

  const members = await prisma.member.findMany({ where: { isActive: true }, select: { id: true } });
  const dueDate = new Date(`${period}-05T00:00:00.000Z`);
  // Idempotent: only create dues for members who don't already have one for this period+category.
  const existing = await prisma.due.findMany({ where: { period, categoryId }, select: { memberId: true } });
  const have = new Set(existing.map((d) => d.memberId));
  const toCreate = members
    .filter((m) => !have.has(m.id))
    .map((m) => ({ memberId: m.id, categoryId, amount, period, dueDate, status: "PENDING" as const, note: note || undefined }));
  if (toCreate.length) await prisma.due.createMany({ data: toCreate });
  const created = toCreate.length;

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Due", after: { categoryId, period, amount, count: created } });
  revalidatePath("/admin/dues");
  revalidatePath("/admin/dashboard");
  return { ok: true, created };
}

/** Settle a due: create an income transaction linked to it + mark it PAID, atomically. */
export async function settleDue(dueId: string): Promise<ActionResult & { receiptNo?: string }> {
  const session = requireAdmin(await auth());
  const due = await prisma.due.findUnique({ where: { id: dueId } });
  if (!due) return { ok: false, error: "Due not found" };
  if (due.status === "PAID") return { ok: false, error: "Already paid" };

  const date = new Date();
  const { receiptNo } = await prisma.$transaction(async (tx) => {
    const rn = await nextReceiptNo(tx, date);
    await tx.transaction.create({
      data: {
        type: "INCOME",
        amount: due.amount,
        date,
        categoryId: due.categoryId ?? undefined,
        memberId: due.memberId,
        dueId: due.id,
        receiptNo: rn,
        createdById: session.user.id,
      },
    });
    await tx.due.update({ where: { id: due.id }, data: { status: "PAID", paidAt: date } });
    return { receiptNo: rn };
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Due", entityId: dueId, after: { status: "PAID", receiptNo } });
  revalidatePath("/admin/dues");
  revalidatePath("/admin/income");
  revalidatePath("/admin/dashboard");
  return { ok: true, receiptNo };
}

/** Waive a due (mark WAIVED, no transaction). */
export async function waiveDue(dueId: string): Promise<ActionResult> {
  const session = requireAdmin(await auth());
  const before = await prisma.due.findUnique({ where: { id: dueId } });
  if (!before) return { ok: false, error: "Due not found" };
  await prisma.due.update({ where: { id: dueId }, data: { status: "WAIVED" } });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Due", entityId: dueId, before, after: { status: "WAIVED" } });
  revalidatePath("/admin/dues");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}
