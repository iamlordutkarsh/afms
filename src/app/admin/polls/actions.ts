"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import type { ActionResult } from "@/lib/validation";

export async function createPoll(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const question = String(formData.get("question") || "").trim();
  const options: string[] = [];
  for (let i = 0; i < 6; i++) {
    const opt = String(formData.get(`option_${i}`) || "").trim();
    if (opt) options.push(opt);
  }
  if (!question) return { ok: false, error: "Question is required." };
  if (options.length < 2) return { ok: false, error: "At least 2 options are required." };

  const poll = await prisma.poll.create({
    data: {
      question,
      createdById: session.user.id,
      options: { create: options.map((text) => ({ text })) },
    },
  });
  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Poll", entityId: poll.id, after: { question, options } });
  revalidatePath("/admin/polls");
  revalidatePath("/member/polls");
  return { ok: true };
}

export async function closePoll(id: string): Promise<ActionResult> {
  const session = requireSuper(await auth());
  await prisma.poll.update({ where: { id }, data: { isActive: false } });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Poll", entityId: id, after: { isActive: false } });
  revalidatePath("/admin/polls");
  revalidatePath("/member/polls");
  return { ok: true };
}
