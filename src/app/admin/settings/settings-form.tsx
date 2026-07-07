"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveSettings } from "./actions";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function SettingsForm({
  initial,
}: {
  initial: {
    associationName: string;
    upiId: string;
    upiPayeeName: string;
    receiptPrefix: string;
    fiscalYearStartMonth: number;
  };
}) {
  const [state, action, pending] = useActionState(saveSettings, { ok: false });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Association &amp; Payments</CardTitle>
        <CardDescription>Shown across the app, receipts, and the member UPI QR.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="associationName">Association name</Label>
            <Input id="associationName" name="associationName" defaultValue={initial.associationName} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input id="upiId" name="upiId" defaultValue={initial.upiId} placeholder="association@upi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upiPayeeName">UPI payee name</Label>
              <Input id="upiPayeeName" name="upiPayeeName" defaultValue={initial.upiPayeeName} placeholder="Our Association" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="receiptPrefix">Receipt prefix</Label>
              <Input id="receiptPrefix" name="receiptPrefix" defaultValue={initial.receiptPrefix} maxLength={8} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalYearStartMonth">Financial year starts</Label>
              <select
                id="fiscalYearStartMonth"
                name="fiscalYearStartMonth"
                defaultValue={String(initial.fiscalYearStartMonth)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i + 1)}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-600">Settings saved.</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
