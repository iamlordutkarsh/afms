"use client";

import { useActionState } from "react";
import { updateOwnProfile } from "@/app/admin/members/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileForm({
  member,
}: {
  member: { name: string; email: string; phone: string; address: string };
}) {
  const [state, action, pending] = useActionState(updateOwnProfile, { ok: false });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{member.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label>Email (login id)</Label>
            <Input value={member.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" inputMode="numeric" pattern="[0-9+\-\s]{4,}" title="Numbers only" defaultValue={member.phone} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={member.address} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-600">Profile updated.</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
