"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RestoreForm() {
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/backup/restore", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: `${json.instructions}\n\nFile saved at: ${json.savedAt}` });
      } else {
        setResult({ ok: false, message: json.error || "Upload failed." });
      }
    } catch {
      setResult({ ok: false, message: "Network error." });
    }
    setUploading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Restore from backup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Upload a <code>.db</code> backup file. The server must be restarted to apply it.
        </p>
        <Input type="file" accept=".db,.sqlite,.sqlite3" onChange={onUpload} disabled={uploading} />
        {uploading && <p className="text-sm text-muted-foreground">Uploading &amp; validating…</p>}
        {result && (
          <p className={`text-sm whitespace-pre-line ${result.ok ? "text-emerald-600" : "text-destructive"}`}>
            {result.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
