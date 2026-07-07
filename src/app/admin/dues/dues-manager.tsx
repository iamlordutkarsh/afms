"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateDues, settleDue, waiveDue } from "@/lib/actions/dues";
import { formatINR } from "@/lib/receipts";

const SELECT = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

type DueRow = { id: string; memberName: string; categoryName: string | null; period: string; amount: number };

export function DuesManager({
  dues,
  categories,
  activeMembers,
  total,
}: {
  dues: DueRow[];
  categories: { id: string; name: string }[];
  activeMembers: number;
  total: number;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(generateDues, { ok: false });

  async function settle(id: string) {
    const res = await settleDue(id);
    if (res.ok) toast.success(`Settled — receipt ${res.receiptNo}`);
    else toast.error(res.error || "Failed");
    router.refresh();
  }
  async function waive(id: string) {
    const res = await waiveDue(id);
    if (res.ok) toast.success("Due waived");
    else toast.error(res.error || "Failed");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate dues</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-3 sm:grid-cols-5">
            <div className="space-y-1 sm:col-span-2">
              <Label>Category</Label>
              <select name="categoryId" defaultValue="" className={SELECT}>
                <option value="">—</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Period</Label>
              <Input name="period" type="month" required />
            </div>
            <div className="space-y-1">
              <Label>Amount (₹)</Label>
              <Input name="amount" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-1">
              <Label>Note</Label>
              <Input name="note" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={pending}>{pending ? "Generating…" : "Generate"}</Button>
            </div>
            {state.error && <p className="text-sm text-destructive sm:col-span-5">{state.error}</p>}
            {state.ok && (
              <p className="text-sm text-emerald-600 sm:col-span-5">
                {state.created ?? 0} dues created ({activeMembers} active members). Re-running the same period is a no-op.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Outstanding</h2>
        <span className="text-sm text-muted-foreground">{dues.length} due(s) · {formatINR(total)}</span>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-2 font-medium">Member</th>
              <th className="p-2 font-medium">Category</th>
              <th className="p-2 font-medium">Period</th>
              <th className="p-2 font-medium text-right">Amount</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {dues.map((d) => (
              <tr key={d.id} className="border-t hover:bg-muted/30">
                <td className="p-2 font-medium">{d.memberName}</td>
                <td className="p-2">{d.categoryName ?? "—"}</td>
                <td className="p-2"><Badge variant="outline">{d.period}</Badge></td>
                <td className="p-2 text-right font-medium">{formatINR(d.amount)}</td>
                <td className="p-2 text-right space-x-3 whitespace-nowrap">
                  <button onClick={() => settle(d.id)} className="text-primary hover:underline">Record paid</button>
                  <button onClick={() => waive(d.id)} className="text-muted-foreground hover:text-foreground">Waive</button>
                </td>
              </tr>
            ))}
            {dues.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No outstanding dues. Generate some above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
