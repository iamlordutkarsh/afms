import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreatePollForm } from "./create-form";
import { closePoll } from "./actions";

export const dynamic = "force-dynamic";

export default async function PollsPage() {
  requireSuper(await auth());
  const polls = await prisma.poll.findMany({
    include: {
      options: { include: { _count: { select: { votes: true } } } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Polls</h1>
      <CreatePollForm />

      <div className="space-y-4">
        <h2 className="text-lg font-medium">All polls</h2>
        {polls.length === 0 ? (
          <p className="text-muted-foreground">No polls yet.</p>
        ) : (
          polls.map((p) => (
            <Card key={p.id}>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{p.question}</p>
                  <Badge variant={p.isActive ? "default" : "secondary"}>
                    {p.isActive ? "Active" : "Closed"}
                  </Badge>
                </div>
                {p.options.map((opt) => {
                  const pct = p._count.votes > 0 ? Math.round((opt._count.votes / p._count.votes) * 100) : 0;
                  return (
                    <div key={opt.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{opt.text}</span>
                        <span className="text-muted-foreground">{opt._count.votes} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#f97316" }} />
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{p._count.votes} total votes</span>
                  {p.isActive && (
                    <form action={closePoll.bind(null, p.id) as unknown as (fd: FormData) => Promise<void>}>
                      <Button type="submit" variant="outline" size="sm">Close poll</Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
