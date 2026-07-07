import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/receipts";
import { IncomeRecordForm } from "./record-form";

export const dynamic = "force-dynamic";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const where = {
    type: "INCOME" as const,
    ...(q ? { OR: [{ receiptNo: { contains: q } }, { note: { contains: q } }] } : {}),
  };
  const [txns, members, categories] = await Promise.all([
    prisma.transaction.findMany({ where, include: { member: true, category: true }, orderBy: { date: "desc" }, take: 300 }),
    prisma.member.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { type: "INCOME", isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const total = txns.reduce((s, t) => s + t.amount, 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Income</h1>

      <IncomeRecordForm members={members} categories={categories} today={today} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <form className="flex gap-2 max-w-md">
          <Input name="q" defaultValue={q} placeholder="Search receipt / note…" />
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
              <th className="p-2 font-medium">Receipt</th>
              <th className="p-2 font-medium">Date</th>
              <th className="p-2 font-medium">Member</th>
              <th className="p-2 font-medium">Category</th>
              <th className="p-2 font-medium">Method</th>
              <th className="p-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-t hover:bg-muted/30">
                <td className="p-2 font-mono text-xs">{t.receiptNo}</td>
                <td className="p-2">{t.date.toLocaleDateString("en-IN")}</td>
                <td className="p-2">{t.member?.name ?? "—"}</td>
                <td className="p-2">{t.category?.name ?? "—"}</td>
                <td className="p-2"><Badge variant="outline">{t.method ?? "—"}</Badge></td>
                <td className="p-2 text-right font-medium">{formatINR(t.amount)}</td>
              </tr>
            ))}
            {txns.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No income recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
