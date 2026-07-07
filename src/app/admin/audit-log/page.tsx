import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireSuper } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const SELECT = "flex h-9 rounded-md border border-input bg-transparent px-3 text-sm";

const ENTITIES = [
  "Member", "Transaction", "Due", "Setting", "Category",
  "Notification", "Poll", "RegistrationRequest",
];

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  requireSuper(await auth());
  const { entity } = await searchParams;
  const where = entity ? { entity } : {};

  const logs = await prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>

      <form className="flex items-center gap-2">
        <select name="entity" defaultValue={entity ?? ""} className={SELECT}>
          <option value="">All entities</option>
          {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 rounded-md border border-input text-sm hover:bg-muted">
          Filter
        </button>
      </form>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-2 font-medium">When</th>
              <th className="p-2 font-medium">Who</th>
              <th className="p-2 font-medium">Action</th>
              <th className="p-2 font-medium">Entity</th>
              <th className="p-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t hover:bg-muted/30">
                <td className="p-2 whitespace-nowrap text-xs">
                  {l.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="p-2">{l.user?.name ?? "System"}</td>
                <td className="p-2"><Badge variant="outline">{l.action}</Badge></td>
                <td className="p-2 whitespace-nowrap">
                  {l.entity}{l.entityId ? ` ·${l.entityId.slice(-6)}` : ""}
                </td>
                <td className="p-2 max-w-md truncate text-xs text-muted-foreground font-mono">
                  {l.after || l.before || "—"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No audit entries.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{logs.length} entries (showing last 200).</p>
    </div>
  );
}
