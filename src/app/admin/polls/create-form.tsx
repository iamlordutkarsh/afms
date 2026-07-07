"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPoll } from "./actions";

export function CreatePollForm() {
  const [state, action, pending] = useActionState(createPoll, { ok: false });
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Create a poll</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="question">Question</Label>
            <Input id="question" name="question" placeholder="e.g. Should we host the annual dinner in December?" required />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Label htmlFor={`option_${i}`}>Option {i + 1}{i < 2 ? " *" : ""}</Label>
              <Input id={`option_${i}`} name={`option_${i}`} placeholder={`Choice ${i + 1}`} />
            </div>
          ))}
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-600">Poll created — members can vote now.</p>}
          <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create poll"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
