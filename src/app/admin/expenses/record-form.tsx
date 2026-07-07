"use client";

import { useActionState, useState } from "react";
import { createTransaction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYMENT_METHODS } from "@/lib/constants";

const SELECT = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

export function ExpenseRecordForm({
  categories,
  today,
}: {
  categories: { id: string; name: string }[];
  today: string;
}) {
  const [state, action, pending] = useActionState(createTransaction, { ok: false });
  const [billUrl, setBillUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/uploads/bills", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setBillUrl(json.path);
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="hidden" name="type" value="EXPENSE" />
          <input type="hidden" name="billUrl" value={billUrl ?? ""} />
          <div className="space-y-1">
            <Label>Category</Label>
            <select name="categoryId" defaultValue="" className={SELECT}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Payee / purpose</Label>
            <Input name="note" placeholder="e.g. Electricity bill — BSES" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Bill / receipt</Label>
            <Input
              type="file"
              onChange={onFile}
              accept="image/png,image/jpeg,image/webp,application/pdf"
            />
            {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
            {uploadErr && <p className="text-xs text-destructive">{uploadErr}</p>}
            {billUrl && (
              <a href={billUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                View uploaded file ↗
              </a>
            )}
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending || uploading}>{pending ? "Saving…" : "Record expense"}</Button>
          </div>
          {state.error && <p className="text-sm text-destructive sm:col-span-full">{state.error}</p>}
          {state.ok && <p className="text-sm text-emerald-600 sm:col-span-full">Expense recorded.</p>}
        </form>
      </CardContent>
    </Card>
  );
}
