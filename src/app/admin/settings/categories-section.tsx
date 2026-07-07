"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCategory, toggleCategory } from "./actions";

type CategoryData = { id: string; name: string; type: string; isActive: boolean };

export function CategoriesSection({ initial }: { initial: CategoryData[] }) {
  const [state, action, pending] = useActionState(createCategory, { ok: false });
  const income = initial.filter((c) => c.type === "INCOME");
  const expense = initial.filter((c) => c.type === "EXPENSE");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>Income sources and expense types used when recording transactions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <CategoryList title="Income" items={income} />
          <CategoryList title="Expense" items={expense} />
        </div>

        <form action={action} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] border-t pt-4">
          <div className="space-y-1">
            <Label htmlFor="name">New category name</Label>
            <Input id="name" name="name" placeholder="e.g. Building Fund" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              defaultValue="INCOME"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add"}
            </Button>
          </div>
          {state.error && <p className="text-sm text-destructive sm:col-span-3">{state.error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

function CategoryList({ title, items }: { title: string; items: CategoryData[] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="space-y-1">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded border px-3 py-1.5 text-sm">
            <span className={c.isActive ? "" : "text-muted-foreground line-through"}>{c.name}</span>
            <button
              onClick={() => toggleCategory(c.id)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {c.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
      </div>
    </div>
  );
}
