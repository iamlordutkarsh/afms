"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PayQrButton({
  amount,
  note,
  ref,
}: {
  amount: number;
  note: string;
  ref: string;
}) {
  const [data, setData] = useState<{ qr?: string; deepLink?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function show() {
    setLoading(true);
    setData(null);
    try {
      const params = new URLSearchParams({ amount: String(amount), note, ref });
      const res = await fetch(`/api/upi/qr?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load QR");
      setData(json);
    } catch (e) {
      setData({ error: e instanceof Error ? e.message : "Failed" });
    }
    setLoading(false);
  }

  if (data?.qr) {
    return (
      <div className="space-y-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.qr} alt="UPI QR code" className="w-44 h-44 rounded border" />
        <a href={data.deepLink} className="block text-sm text-primary hover:underline">
          Open in UPI app →
        </a>
      </div>
    );
  }

  return (
    <div>
      <Button variant="outline" onClick={show} disabled={loading}>
        {loading ? "Loading…" : "Pay via UPI"}
      </Button>
      {data?.error && <p className="text-xs text-destructive mt-1">{data.error}</p>}
    </div>
  );
}
