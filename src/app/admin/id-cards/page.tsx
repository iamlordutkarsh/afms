import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_LABELS, type Role } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function IdCardsPage() {
  requireSuper(await auth());

  const members = await prisma.member.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, phone: true, role: true, joinedAt: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">ID Cards</h1>
        <Link href="/api/id-cards/all" target="_blank" className={buttonVariants()}>
          Download All (PDF)
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        {members.length} active member(s). Click a member to download their ID card as a PDF.
      </p>

      <div className="grid gap-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-4 border rounded-lg p-3 hover:bg-muted/30"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{m.name}</p>
                <Badge variant="outline">{ROLE_LABELS[m.role as Role]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {m.email} · {m.phone}
              </p>
              <p className="text-xs text-muted-foreground">
                Member ID: <code className="font-mono">{m.id.slice(-10).toUpperCase()}</code>
                {" · "}Joined {m.joinedAt.toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
              </p>
            </div>
            <Link
              href={`/api/id-cards/${m.id}`}
              target="_blank"
              className="text-primary hover:underline text-sm whitespace-nowrap"
            >
              Download card ↗
            </Link>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No active members.</p>
        )}
      </div>
    </div>
  );
}
