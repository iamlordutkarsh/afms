"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { updateMember, resetPassword } from "../actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLES, ROLE_LABELS } from "@/lib/constants";

type MemberData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address: string | null;
  isActive: boolean;
};

export function EditMemberForm({ member }: { member: MemberData }) {
  const bound = updateMember.bind(null, member.id);
  const [state, action, pending] = useActionState(bound, { ok: false });
  const [resetPw, setResetPw] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  async function onReset() {
    setResetting(true);
    const res = await resetPassword(member.id);
    setResetting(false);
    if (res.ok && res.tempPassword) setResetPw(res.tempPassword);
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit member</h1>
        <Link href="/admin/members" className={buttonVariants({ variant: "outline" })}>
          Back
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{member.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={member.name} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={member.email} disabled />
              <p className="text-xs text-muted-foreground">Email can&apos;t be changed (it&apos;s the login id).</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={member.phone} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                defaultValue={member.role}
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
              <Input id="address" name="address" defaultValue={member.address ?? ""} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={member.isActive} />
              Active (can log in)
            </label>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state.ok && <p className="text-sm text-emerald-600">Saved.</p>}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reset password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" onClick={onReset} disabled={resetting}>
            {resetting ? "Generating…" : "Generate new temp password"}
          </Button>
          {resetPw && (
            <div>
              <p className="text-sm text-muted-foreground">New temporary password:</p>
              <code className="block rounded bg-muted px-3 py-2 font-mono">{resetPw}</code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
