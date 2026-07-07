"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/validation";

export async function castVote(pollId: string, optionId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authenticated" };
  try {
    await prisma.pollVote.create({
      data: { pollId, optionId, userId: session.user.id },
    });
  } catch {
    return { ok: false, error: "You've already voted on this poll." };
  }
  revalidatePath("/member/polls");
  return { ok: true };
}
