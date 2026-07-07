import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RestoreForm } from "./restore-form";

export const dynamic = "force-dynamic";

export default async function BackupPage() {
  requireSuper(await auth());

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Backup &amp; Restore</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Download backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Creates a consistent snapshot of the entire database (all members, transactions, dues,
            polls, settings). Download regularly and store safely.
          </p>
          <Link href="/api/backup/download" className={buttonVariants()}>
            Download backup (.db)
          </Link>
        </CardContent>
      </Card>

      <RestoreForm />

      <Card>
        <CardContent className="text-xs text-muted-foreground space-y-1 pt-6">
          <p><b>Database:</b> <code>prisma/dev.db</code></p>
          <p><b>Uploaded bills:</b> <code>uploads/bills/</code></p>
          <p>For a complete backup, also copy the <code>uploads/</code> folder.</p>
        </CardContent>
      </Card>
    </div>
  );
}
