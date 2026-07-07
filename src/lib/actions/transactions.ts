"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/rbac";
import { ADMIN_ROLES } from "@/lib/constants";
import { transactionSchema, type ActionResult } from "@/lib/validation";
import { nextReceiptNo } from "@/lib/receipts";
import { logAudit } from "@/lib/audit";

/** Record an income or expense. Income gets an auto receipt number atomically. */
export async function createTransaction(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };
  const isAdmin = ADMIN_ROLES.includes(session.user.role);
  const parsed = transactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const { type, amount, date, method, categoryId, note, utrNo, billUrl } = parsed.data;
  // Non-admins can only record income for themselves; admins can pick any member.
  const memberId = isAdmin ? parsed.data.memberId : (type === "INCOME" ? session.user.id : undefined);
  const txDate = new Date(date);

  const { txn, receiptNo } = await prisma.$transaction(async (tx) => {
    let rn: string | undefined;
    if (type === "INCOME") rn = await nextReceiptNo(tx, txDate);
    const created = await tx.transaction.create({
      data: {
        type,
        amount: Math.round(amount * 100) / 100,
        date: txDate,
        method: method || undefined,
        categoryId: categoryId || undefined,
        memberId: type === "INCOME" ? memberId || undefined : undefined,
        note: note || undefined,
        utrNo: utrNo || undefined,
        billUrl: type === "EXPENSE" ? billUrl || undefined : undefined,
        receiptNo: rn,
        createdById: session.user.id,
      },
    });
    return { txn: created, receiptNo: rn };
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Transaction", entityId: txn.id, after: txn });
  revalidatePath("/admin/income");
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/dashboard");
  return { ok: true, receiptNo };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const session = requireAdmin(await auth());
  const before = await prisma.transaction.findUnique({ where: { id } });
  if (!before) return { ok: false, error: "Transaction not found" };
  await prisma.transaction.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entity: "Transaction", entityId: id, before });
  revalidatePath("/admin/income");
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}
