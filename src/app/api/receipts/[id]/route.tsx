import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/constants";
import { ReceiptDocument } from "@/lib/receipts/receipt-pdf";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const txn = await prisma.transaction.findUnique({
    where: { id },
    include: { member: true, category: true },
  });

  if (!txn || txn.type !== "INCOME") return new NextResponse("Not found", { status: 404 });

  // Owner (the member who paid) OR admin can view.
  const isOwner = txn.memberId === session.user.id;
  const isAdmin = ADMIN_ROLES.includes(session.user.role);
  if (!isOwner && !isAdmin) return new NextResponse("Forbidden", { status: 403 });

  const rows = await prisma.setting.findMany({ where: { key: { in: ["associationName"] } } });
  const settings = Object.fromEntries(rows.map((s) => [s.key, s.value]));

  const nodeStream = await renderToStream(
    <ReceiptDocument
      data={{
        associationName: settings.associationName || "",
        receiptNo: txn.receiptNo || "",
        date: txn.date.toLocaleDateString("en-IN"),
        memberName: txn.member?.name ?? "—",
        categoryName: txn.category?.name ?? "—",
        method: txn.method ?? "—",
        amount: txn.amount,
        note: txn.note ?? undefined,
      }}
    />,
  );

  return new Response(nodeStream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${txn.receiptNo}.pdf"`,
    },
  });
}
