import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/receipts";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MemberDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [outstandingAgg, paidAgg, member, recent] = await Promise.all([
    prisma.due.aggregate({ _sum: { amount: true }, where: { memberId: session.user.id, status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { memberId: session.user.id, type: "INCOME" } }),
    prisma.member.findUnique({ where: { id: session.user.id }, select: { joinedAt: true } }),
    prisma.transaction.findMany({
      where: { memberId: session.user.id },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
  ]);

  const outstanding = outstandingAgg._sum.amount ?? 0;
  const paid = paidAgg._sum.amount ?? 0;
  const since = member?.joinedAt
    ? member.joinedAt.toLocaleDateString("en-IN", { year: "numeric", month: "short" })
    : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Outstanding dues</CardTitle></CardHeader>
          <CardContent><div className={`text-2xl font-semibold ${outstanding > 0 ? "text-amber-600" : ""}`}>{formatINR(outstanding)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total paid</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold text-emerald-600">{formatINR(paid)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Member since</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{since}</div></CardContent>
        </Card>
      </div>

      {outstanding > 0 && (
        <Card>
          <CardContent className="py-6 space-y-3">
            <p>You have outstanding dues of <b>{formatINR(outstanding)}</b>. Pay via UPI to clear them.</p>
            <Link href="/member/dues" className={buttonVariants()}>Pay dues →</Link>
          </CardContent>
        </Card>
      )}

      {recent.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">My recent entries</h2>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="p-2 font-medium">Date</th>
                  <th className="p-2 font-medium">Type</th>
                  <th className="p-2 font-medium">Category</th>
                  <th className="p-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-muted/30">
                    <td className="p-2">{t.date.toLocaleDateString("en-IN")}</td>
                    <td className="p-2"><Badge variant={t.type === "INCOME" ? "default" : "secondary"}>{t.type}</Badge></td>
                    <td className="p-2">{t.category?.name ?? "—"}</td>
                    <td className={`p-2 text-right font-medium ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatINR(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/member/payments" className="text-sm text-primary hover:underline">View all payments →</Link>
        </div>
      )}
    </div>
  );
}
