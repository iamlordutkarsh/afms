import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/constants";
import { toCSV } from "@/lib/exports/csv";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = ADMIN_ROLES.includes(session.user.role);

  const params = new URL(req.url).searchParams;
  const format = params.get("format") === "csv" ? "csv" : "xlsx";
  const type = params.get("type") || undefined;
  const from = params.get("from");
  const to = params.get("to");
  const categoryId = params.get("categoryId") || undefined;
  const memberId = isAdmin ? (params.get("memberId") || undefined) : session.user.id;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (memberId) where.memberId = memberId;
  if (from || to) {
    const date: Record<string, Date> = {};
    if (from) date.gte = new Date(from);
    if (to) { const t = new Date(to); t.setHours(23, 59, 59, 999); date.lte = t; }
    where.date = date;
  }

  const txns = await prisma.transaction.findMany({
    where,
    include: { member: true, category: true },
    orderBy: { date: "desc" },
    take: 5000,
  });

  const rows = txns.map((t) => ({
    Receipt: t.receiptNo || "",
    Date: t.date.toLocaleDateString("en-IN"),
    Type: t.type,
    Member: t.member?.name || "",
    Category: t.category?.name || "",
    Method: t.method || "",
    Amount: t.amount,
    Note: t.note || "",
    UTR: t.utrNo || "",
  }));

  if (format === "csv") {
    return new Response(toCSV(rows), {
      headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="transactions.csv"' },
    });
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Transactions");
  ws.columns = Object.keys(rows[0] ?? { Receipt: "" }).map((k) => ({ header: k, key: k, width: 16 }));
  ws.columns.forEach((c) => { if (c.key === "Amount") c.numFmt = "#,##0.00"; });
  rows.forEach((r) => ws.addRow(r));
  ws.getRow(1).font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="transactions.xlsx"',
    },
  });
}
