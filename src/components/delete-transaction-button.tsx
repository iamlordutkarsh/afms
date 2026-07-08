"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTransaction } from "@/lib/actions/transactions";

export function DeleteTransactionButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    await deleteTransaction(id);
    setDeleting(false);
    router.refresh();
  }

  return (
    <button
      onClick={onDelete}
      disabled={deleting}
      className="text-destructive hover:underline text-xs disabled:opacity-50"
    >
      {deleting ? "…" : "Delete"}
    </button>
  );
}
