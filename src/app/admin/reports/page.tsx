import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/receipts";

export const dynamic = "force-dynamic";

const SELECT = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const from = sp.from;
  const to = sp.to;
  const type = sp.type;
  const categoryId = sp.categoryId;
  const memberId = sp.memberId;

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

  const [txns, categories, members] = await Promise.all([
    prisma.transaction.findMany({ where, include: { member: true, category: true }, orderBy: { date: "desc" }, take: 1000 }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.member.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  if (type) qs.set("type", type);
  if (categoryId) qs.set("categoryId", categoryId);
  if (memberId) qs.set("memberId", memberId);
  const q = qs.toString();

  const total = txns.reduce((s, t) => s + (t.type === "INCOME" ? t.amount : -t.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>

      <form className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Input type="date" name="from" defaultValue={from} />
        <Input type="date" name="to" defaultValue={to} />
        <select name="type" defaultValue={type ?? ""} className={SELECT}>
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <select name="categoryId" defaultValue={categoryId ?? ""} className={SELECT}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="memberId" defaultValue={memberId ?? ""} className={SELECT}>
          <option value="">All members</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <Button type="submit">Apply</Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{txns.length} rows · Net <b className="text-foreground">{formatINR(total)}</b></span>
        <div className="flex gap-2">
          <Link href={`/api/exports/transactions?${q}&format=xlsx`} className={SELECT + " px-3 hover:bg-muted"}>Export Excel</Link>
          <Link href={`/api/exports/transactions?${q}&format=csv`} className={SELECT + " px-3 hover:bg-muted"}>Export CSV</Link>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-2 font-medium">Date</th>
              <th className="p-2 font-medium">Type</th>
              <th className="p-2 font-medium">Member</th>
              <th className="p-2 font-medium">Category</th>
              <th className="p-2 font-medium">Method</th>
              <th className="p-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-t hover:bg-muted/30">
                <td className="p-2">{t.date.toLocaleDateString("en-IN")}</td>
                <td className="p-2"><Badge variant={t.type === "INCOME" ? "default" : "secondary"}>{t.type}</Badge></td>
                <td className="p-2">{t.member?.name ?? "—"}</td>
                <td className="p-2">{t.category?.name ?? "—"}</td>
                <td className="p-2">{t.method ?? "—"}</td>
                <td className={`p-2 text-right font-medium ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type === "INCOME" ? "+" : "−"}{formatINR(t.amount)}
                </td>
              </tr>
            ))}
            {txns.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No transactions for these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
