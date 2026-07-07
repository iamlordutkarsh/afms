import { prisma } from "@/lib/prisma";
import { DuesManager } from "./dues-manager";

export const dynamic = "force-dynamic";

export default async function DuesPage() {
  const [dues, categories, activeMembers] = await Promise.all([
    prisma.due.findMany({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
      include: { member: true, category: true },
      orderBy: { dueDate: "asc" },
      take: 500,
    }),
    prisma.category.findMany({ where: { type: "INCOME", isActive: true }, orderBy: { name: "asc" } }),
    prisma.member.count({ where: { isActive: true } }),
  ]);

  const total = dues.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dues</h1>
      <DuesManager
        dues={dues.map((d) => ({
          id: d.id,
          memberName: d.member.name,
          categoryName: d.category?.name ?? null,
          period: d.period,
          amount: d.amount,
        }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        activeMembers={activeMembers}
        total={total}
      />
    </div>
  );
}
