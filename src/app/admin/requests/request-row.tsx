"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { approveRequest, rejectRequest } from "./actions";

const SELECT = "flex h-9 rounded-md border border-input bg-transparent px-3 text-sm max-w-[180px]";

type RequestData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  note: string | null;
  createdAt: string;
};

export function RequestRow({ request }: { request: RequestData }) {
  const bound = approveRequest.bind(null, request.id);
  const [state, action, pending] = useActionState(bound, { ok: false });

  if (state.ok) {
    return (
      <Card>
        <CardContent className="py-4 space-y-1">
          <p className="text-sm font-medium text-emerald-600">
            ✓ {state.name} approved as a member.
          </p>
          <p className="text-xs text-muted-foreground">
            They can log in with the email and password they chose at signup.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-medium">{request.name}</p>
            <p className="text-sm text-muted-foreground">
              {request.email} · {request.phone}
            </p>
            {request.address && (
              <p className="text-sm text-muted-foreground">{request.address}</p>
            )}
            {request.note && (
              <p className="text-sm italic text-muted-foreground">&ldquo;{request.note}&rdquo;</p>
            )}
            <p className="text-xs text-muted-foreground">
              Requested {new Date(request.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
          <Badge>Pending</Badge>
        </div>
        <form action={action} className="flex flex-wrap items-end gap-2">
          <select name="role" defaultValue="MEMBER" className={SELECT}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={pending}>
            {pending ? "Approving…" : "Approve"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => rejectRequest(request.id)}
          >
            Reject
          </Button>
          {state.error && (
            <span className="text-sm text-destructive">{state.error}</span>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
