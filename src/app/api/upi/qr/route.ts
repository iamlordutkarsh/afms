import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildUpiDeepLink, generateQrDataUrl } from "@/lib/qr/upi";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const rows = await prisma.setting.findMany({ where: { key: { in: ["upiId", "upiPayeeName"] } } });
  const settings = Object.fromEntries(rows.map((s) => [s.key, s.value]));

  if (!settings.upiId) {
    return NextResponse.json({ error: "UPI ID not configured — set it in Settings." }, { status: 400 });
  }

  const amount = params.get("amount") ? Number(params.get("amount")) : undefined;
  const note = params.get("note") || undefined;
  const ref = params.get("ref") || undefined;

  const deepLink = buildUpiDeepLink({
    upiId: settings.upiId,
    payeeName: settings.upiPayeeName || "Association",
    amount,
    note,
    ref,
  });
  const qr = await generateQrDataUrl(deepLink);

  return NextResponse.json({ deepLink, qr });
}
