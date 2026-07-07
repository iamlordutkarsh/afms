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
    prisma.transaction.findMany({ include: { category: true, member: true }, orderBy: { date: "desc" }, take: 1000 }),
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

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthIncome = txns.filter((t) => t.type === "INCOME" && t.date >= monthStart).reduce((s, t) => s + t.amount, 0);
  const monthExpense = txns.filter((t) => t.type === "EXPENSE" && t.date >= monthStart).reduce((s, t) => s + t.amount, 0);

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Income</span>
              <span className="font-medium text-emerald-600">{formatINR(monthIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expenses</span>
              <span className="font-medium text-rose-600">{formatINR(monthExpense)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-medium">Net</span>
              <span className="font-bold">{formatINR(monthIncome - monthExpense)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {txns.slice(0, 8).map((t) => (
                <div key={t.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t.member?.name ?? "—"} · {t.category?.name ?? "—"}
                  </span>
                  <span className={t.type === "INCOME" ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                    {t.type === "INCOME" ? "+" : "−"}{formatINR(t.amount)}
                  </span>
                </div>
              ))}
              {txns.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
