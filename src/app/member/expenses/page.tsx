import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/receipts";
import { ExpenseRecordForm } from "@/app/admin/expenses/record-form";

export const dynamic = "force-dynamic";

export default async function MemberExpensesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [txns, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { type: "EXPENSE" },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 200,
    }),
    prisma.category.findMany({ where: { type: "EXPENSE", isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const total = txns.reduce((s, t) => s + t.amount, 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
      <p className="text-sm text-muted-foreground">
        Total expenses: <b className="text-foreground text-lg">{formatINR(total)}</b> · {txns.length} entries
      </p>
      <ExpenseRecordForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} today={today} />
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-2 font-medium">Date</th>
              <th className="p-2 font-medium">Category</th>
              <th className="p-2 font-medium">Note</th>
              <th className="p-2 font-medium">Method</th>
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
                <td className="p-2 text-right font-medium text-rose-600">{formatINR(t.amount)}</td>
              </tr>
            ))}
            {txns.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No expenses recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
