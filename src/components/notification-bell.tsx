"use client";

import { useState, useEffect, useCallback } from "react";

type Notif = { id: string; title: string; message: string; createdAt: string };

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread");
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  async function markRead(id: string) {
    fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1 text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">You&apos;re all caught up.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="block w-full text-left p-3 border-b last:border-0 hover:bg-muted/50"
                >
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
