import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/receipts";

export const dynamic = "force-dynamic";

const BTN = "flex h-9 items-center rounded-md border border-input bg-transparent px-3 text-sm hover:bg-muted";

export default async function MemberReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sp = await searchParams;
  const type = sp.type;
  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const txns = await prisma.transaction.findMany({
    where,
    include: { member: true, category: true },
    orderBy: { date: "desc" },
    take: 500,
  });

  const qs = new URLSearchParams();
  if (type) qs.set("type", type);
  const q = qs.toString();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>

      <form className="flex gap-2">
        <select name="type" defaultValue={type ?? ""} className="flex h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <button type="submit" className="px-4 py-2 rounded-md border border-input text-sm hover:bg-muted">Filter</button>
      </form>

      <div className="flex gap-2">
        <Link href={`/api/exports/transactions?${q}&format=xlsx`} className={BTN}>Export Excel</Link>
        <Link href={`/api/exports/transactions?${q}&format=csv`} className={BTN}>Export CSV</Link>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-2 font-medium">Date</th>
              <th className="p-2 font-medium">Type</th>
              <th className="p-2 font-medium">Member</th>
              <th className="p-2 font-medium">Category</th>
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
                <td className={`p-2 text-right font-medium ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type === "INCOME" ? "+" : "−"}{formatINR(t.amount)}
                </td>
              </tr>
            ))}
            {txns.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No transactions.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
