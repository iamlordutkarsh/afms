import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/receipts";
import { IncomeExpenseBarChart, CategoryPie } from "./charts";

export const dynamic = "force-dynamic";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function lastMonths(n: number): { label: string; key: string }[] {
  const out: { label: string; key: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ label: MONTH_LABELS[d.getMonth()], key: monthKey(d) });
  }
  return out;
}

export default async function AdminDashboardPage() {
  const [incomeAgg, expenseAgg, dueAgg, txns] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "INCOME" } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "EXPENSE" } }),
    prisma.due.aggregate({ _sum: { amount: true }, where: { status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.transaction.findMany({ include: { category: true }, orderBy: { date: "desc" }, take: 1000 }),
  ]);

  const income = incomeAgg._sum.amount ?? 0;
  const expense = expenseAgg._sum.amount ?? 0;
  const balance = income - expense;
  const outstanding = dueAgg._sum.amount ?? 0;

  const months = lastMonths(6);
  const monthData = months.map((m) => ({
    label: m.label,
    income: txns.filter((t) => t.type === "INCOME" && monthKey(t.date) === m.key).reduce((s, t) => s + t.amount, 0),
    expense: txns.filter((t) => t.type === "EXPENSE" && monthKey(t.date) === m.key).reduce((s, t) => s + t.amount, 0),
  }));

  const catMap = new Map<string, number>();
  for (const t of txns)
    if (t.type === "INCOME" && t.category) catMap.set(t.category.name, (catMap.get(t.category.name) ?? 0) + t.amount);
  const categoryData = [...catMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const kpis = [
    { label: "Total Income", value: formatINR(income), className: "text-emerald-600" },
    { label: "Total Expenses", value: formatINR(expense), className: "text-rose-600" },
    { label: "Balance", value: formatINR(balance), className: balance >= 0 ? "" : "text-rose-600" },
    { label: "Outstanding Dues", value: formatINR(outstanding), className: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-semibold ${k.className}`}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income vs Expense (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseBarChart data={monthData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={categoryData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
