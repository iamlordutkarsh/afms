import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.notificationRead.upsert({
    where: { notificationId_userId: { notificationId: id, userId: session.user.id } },
    create: { notificationId: id, userId: session.user.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
