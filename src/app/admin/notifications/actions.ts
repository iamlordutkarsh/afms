"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import type { ActionResult } from "@/lib/validation";

export async function sendNotification(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const title = String(formData.get("title") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!title || !message) return { ok: false, error: "Title and message are required." };

  await prisma.notification.create({
    data: { title, message, createdById: session.user.id },
  });
  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Notification", after: { title, message } });
  revalidatePath("/admin/notifications");
  return { ok: true };
}
