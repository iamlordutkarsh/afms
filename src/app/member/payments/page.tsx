import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatINR } from "@/lib/receipts";
import { MemberIncomeForm } from "./income-form";

export const dynamic = "force-dynamic";

export default async function MemberPaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [txns, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { memberId: session.user.id, type: "INCOME" },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 100,
    }),
    prisma.category.findMany({ where: { type: "INCOME", isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const total = txns.reduce((s, t) => s + t.amount, 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Payment History</h1>
      <p className="text-sm text-muted-foreground">
        Total paid: <b className="text-foreground text-lg">{formatINR(total)}</b>
      </p>
      <MemberIncomeForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} today={today} />
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-2 font-medium">Receipt</th>
              <th className="p-2 font-medium">Date</th>
              <th className="p-2 font-medium">Category</th>
              <th className="p-2 font-medium text-right">Amount</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-t hover:bg-muted/30">
                <td className="p-2 font-mono text-xs">{t.receiptNo}</td>
                <td className="p-2">{t.date.toLocaleDateString("en-IN")}</td>
                <td className="p-2">{t.category?.name ?? "—"}</td>
                <td className="p-2 text-right font-medium text-emerald-600">{formatINR(t.amount)}</td>
                <td className="p-2 text-right">
                  <Link
                    href={`/api/receipts/${t.id}`}
                    target="_blank"
                    className="text-primary hover:underline text-xs"
                  >
                    PDF ↗
                  </Link>
                </td>
              </tr>
            ))}
            {txns.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No payments recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
