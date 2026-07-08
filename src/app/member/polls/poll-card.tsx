"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { castVote } from "./actions";

type PollData = {
  id: string;
  question: string;
  options: { id: string; text: string; voteCount: number }[];
  totalVotes: number;
  userVoteOptionId: string | null;
};

export function PollCard({ poll }: { poll: PollData }) {
  const router = useRouter();
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function vote(optionId: string) {
    setVoting(true);
    setError(null);
    const res = await castVote(poll.id, optionId);
    if (!res.ok) setError(res.error || "Failed to vote");
    else router.refresh();
    setVoting(false);
  }

  if (poll.userVoteOptionId) {
    return (
      <Card>
        <CardContent className="py-4 space-y-3">
          <p className="font-medium">{poll.question}</p>
          {poll.options.map((opt) => {
            const pct = poll.totalVotes > 0 ? Math.round((opt.voteCount / poll.totalVotes) * 100) : 0;
            return (
              <div key={opt.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={opt.id === poll.userVoteOptionId ? "font-semibold" : ""}>
                    {opt.id === poll.userVoteOptionId ? "✓ " : ""}{opt.text}
                  </span>
                  <span className="text-muted-foreground">{pct}% · {opt.voteCount}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: "#f97316" }} />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">{poll.totalVotes} total votes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <p className="font-medium">{poll.question}</p>
        <div className="space-y-2">
          {poll.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => vote(opt.id)}
              disabled={voting}
              className="w-full text-left p-2.5 border rounded-md hover:bg-muted/50 text-sm transition-colors disabled:opacity-50"
            >
              {opt.text}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
