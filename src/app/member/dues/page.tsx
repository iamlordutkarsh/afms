import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/receipts";
import { PayQrButton } from "./pay-qr";

export const dynamic = "force-dynamic";

export default async function MemberDuesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dues = await prisma.due.findMany({
    where: { memberId: session.user.id, status: { in: ["PENDING", "OVERDUE"] } },
    include: { category: true },
    orderBy: { dueDate: "asc" },
  });
  const total = dues.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Dues</h1>

      {dues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No outstanding dues — you&apos;re all paid up! 🎉
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Outstanding total: <b className="text-foreground text-lg">{formatINR(total)}</b>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {dues.map((d) => (
              <Card key={d.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {d.category?.name ?? "Due"}
                    <Badge variant="outline">{d.period}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-semibold">{formatINR(d.amount)}</div>
                  <p className="text-xs text-muted-foreground">
                    Due: {d.dueDate.toLocaleDateString("en-IN")}
                    {d.note ? ` · ${d.note}` : ""}
                  </p>
                  <PayQrButton amount={d.amount} note={d.category?.name || "Dues"} ref={`DUE-${d.id.slice(-6)}`} />
                  <p className="text-xs text-muted-foreground">
                    Pay via UPI, then wait for admin to confirm.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
