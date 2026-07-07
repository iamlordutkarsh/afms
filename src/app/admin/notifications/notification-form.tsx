"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendNotification } from "./actions";

export function NotificationForm() {
  const [state, action, pending] = useActionState(sendNotification, { ok: false });
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Send notification</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g. Annual General Meeting" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" placeholder="Write your message to all members…" rows={3} required />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-600">Notification sent to all users.</p>}
          <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send to everyone"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
