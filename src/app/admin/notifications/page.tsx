import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { NotificationForm } from "./notification-form";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  requireSuper(await auth());
  const notifications = await prisma.notification.findMany({
    include: { _count: { select: { reads: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
      <NotificationForm />

      <div className="space-y-3">
        <h2 className="text-lg font-medium">History</h2>
        {notifications.length === 0 ? (
          <p className="text-muted-foreground">No notifications sent yet.</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="border rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{n.title}</p>
                <span className="text-xs text-muted-foreground">
                  {n.createdAt.toLocaleDateString("en-IN")} · {n._count.reads} read
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
