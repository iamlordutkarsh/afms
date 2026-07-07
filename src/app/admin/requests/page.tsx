import { prisma } from "@/lib/prisma";
import { RequestRow } from "./request-row";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const [pending, recent] = await Promise.all([
    prisma.registrationRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" } }),
    prisma.registrationRequest.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 10,
      include: { reviewedBy: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Registration Requests</h1>

      {pending.length === 0 ? (
        <p className="text-muted-foreground">No pending requests.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((r) => (
            <RequestRow
              key={r.id}
              request={{
                id: r.id,
                name: r.name,
                email: r.email,
                phone: r.phone,
                address: r.address,
                note: r.note,
                createdAt: r.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Recently processed</h2>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="p-2 font-medium">Name</th>
                  <th className="p-2 font-medium">Email</th>
                  <th className="p-2 font-medium">Status</th>
                  <th className="p-2 font-medium">Role</th>
                  <th className="p-2 font-medium">By</th>
                  <th className="p-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.name}</td>
                    <td className="p-2 text-muted-foreground">{r.email}</td>
                    <td className="p-2">
                      <span className={r.status === "APPROVED" ? "text-emerald-600" : "text-rose-600"}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2">{r.assignedRole || "—"}</td>
                    <td className="p-2 text-muted-foreground">{r.reviewedBy?.name || "—"}</td>
                    <td className="p-2 text-muted-foreground">
                      {r.reviewedAt?.toLocaleDateString("en-IN") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
