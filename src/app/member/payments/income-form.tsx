"use client";

import { useActionState } from "react";
import { createTransaction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYMENT_METHODS } from "@/lib/constants";

const SELECT = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

export function MemberIncomeForm({
  categories,
  today,
}: {
  categories: { id: string; name: string }[];
  today: string;
}) {
  const [state, action, pending] = useActionState(createTransaction, { ok: false });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Record a payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="hidden" name="type" value="INCOME" />
          <div className="space-y-1">
            <Label>Category</Label>
            <select name="categoryId" defaultValue="" className={SELECT}>
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Amount (₹)</Label>
            <Input name="amount" type="number" step="0.01" min="0" required />
          </div>
          <div className="space-y-1">
            <Label>Date</Label>
            <Input name="date" type="date" defaultValue={today} required />
          </div>
          <div className="space-y-1">
            <Label>Method</Label>
            <select name="method" defaultValue="" className={SELECT}>
              <option value="">—</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Note</Label>
            <Input name="note" />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Record payment"}</Button>
          </div>
          {state.error && <p className="text-sm text-destructive sm:col-span-full">{state.error}</p>}
          {state.ok && state.receiptNo && (
            <p className="text-sm text-emerald-600 sm:col-span-full">
              Receipt <code className="font-mono">{state.receiptNo}</code> created.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
