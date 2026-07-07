import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/receipts";
import { ExpenseRecordForm } from "./record-form";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const where = {
    type: "EXPENSE" as const,
    ...(q ? { OR: [{ note: { contains: q } }, { utrNo: { contains: q } }] } : {}),
  };
  const [txns, categories] = await Promise.all([
    prisma.transaction.findMany({ where, include: { category: true }, orderBy: { date: "desc" }, take: 300 }),
    prisma.category.findMany({ where: { type: "EXPENSE", isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const total = txns.reduce((s, t) => s + t.amount, 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>

      <ExpenseRecordForm categories={categories} today={today} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <form className="flex gap-2 max-w-md">
          <Input name="q" defaultValue={q} placeholder="Search note / ref…" />
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <span className="text-sm text-muted-foreground">
          Total: <b className="text-foreground">{formatINR(total)}</b> · {txns.length} entry(ies)
        </span>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-2 font-medium">Date</th>
              <th className="p-2 font-medium">Category</th>
              <th className="p-2 font-medium">Payee / note</th>
              <th className="p-2 font-medium">Method</th>
              <th className="p-2 font-medium">Bill</th>
              <th className="p-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-t hover:bg-muted/30">
                <td className="p-2">{t.date.toLocaleDateString("en-IN")}</td>
                <td className="p-2">{t.category?.name ?? "—"}</td>
                <td className="p-2 max-w-[20rem] truncate">{t.note ?? "—"}</td>
                <td className="p-2"><Badge variant="outline">{t.method ?? "—"}</Badge></td>
                <td className="p-2">
                  {t.billUrl ? (
                    <Link href={t.billUrl} target="_blank" className="text-primary hover:underline text-xs">view ↗</Link>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="p-2 text-right font-medium">{formatINR(t.amount)}</td>
              </tr>
            ))}
            {txns.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No expenses recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
