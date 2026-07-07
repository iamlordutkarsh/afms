"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { settingsSchema, categoryCreateSchema, type ActionResult } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function saveSettings(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined)
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
  }
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Setting", after: parsed.data });
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function createCategory(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const parsed = categoryCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const cat = await prisma.category.create({ data: parsed.data });
  await logAudit({ userId: session.user.id, action: "CREATE", entity: "Category", entityId: cat.id, after: cat });
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function toggleCategory(id: string): Promise<ActionResult> {
  const session = requireSuper(await auth());
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return { ok: false, error: "Category not found" };
  const updated = await prisma.category.update({ where: { id }, data: { isActive: !cat.isActive } });
  await logAudit({ userId: session.user.id, action: "UPDATE", entity: "Category", entityId: id, after: updated });
  revalidatePath("/admin/settings");
  return { ok: true };
}
