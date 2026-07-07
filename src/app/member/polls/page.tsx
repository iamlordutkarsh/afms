import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PollCard } from "./poll-card";

export const dynamic = "force-dynamic";

export default async function MemberPollsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const polls = await prisma.poll.findMany({
    where: { isActive: true },
    include: {
      options: { include: { _count: { select: { votes: true } } } },
      votes: { where: { userId: session.user.id }, select: { optionId: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Polls</h1>
      {polls.length === 0 ? (
        <p className="text-muted-foreground">No active polls right now. Check back later!</p>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {polls.map((p) => (
            <PollCard
              key={p.id}
              poll={{
                id: p.id,
                question: p.question,
                options: p.options.map((o) => ({ id: o.id, text: o.text, voteCount: o._count.votes })),
                totalVotes: p._count.votes,
                userVoteOptionId: p.votes[0]?.optionId ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
