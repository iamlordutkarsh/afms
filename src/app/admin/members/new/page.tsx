"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createMember } from "../actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLES, ROLE_LABELS } from "@/lib/constants";

export default function NewMemberPage() {
  const [state, action, pending] = useActionState(createMember, { ok: false });

  if (state.ok && state.tempPassword) {
    return (
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Member created</h1>
        <Card>
          <CardHeader>
            <CardTitle>{state.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Temporary password (share it securely with the member):</p>
            <code className="block rounded bg-muted px-3 py-2 text-lg font-mono">{state.tempPassword}</code>
            <p className="text-xs text-muted-foreground">
              They can sign in immediately. A self-service &ldquo;change password&rdquo; is Phase 2.
            </p>
            <Link href="/admin/members" className={buttonVariants({ variant: "outline" })}>
              Back to list
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Add member</h1>
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            defaultValue="MEMBER"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Create member"}
          </Button>
          <Link href="/admin/members" className={buttonVariants({ variant: "outline" })}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
