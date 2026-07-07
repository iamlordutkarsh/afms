import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "@/lib/constants";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      }
    : {};
  const members = await prisma.member.findMany({ where, orderBy: { name: "asc" }, take: 500 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <Link href="/admin/members/new" className={buttonVariants()}>
          Add member
        </Link>
      </div>

      <form className="flex gap-2 max-w-md">
        <Input name="q" defaultValue={q} placeholder="Search name, email, phone…" />
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-2 font-medium">Name</th>
              <th className="p-2 font-medium">Email</th>
              <th className="p-2 font-medium">Phone</th>
              <th className="p-2 font-medium">Role</th>
              <th className="p-2 font-medium">Status</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t hover:bg-muted/30">
                <td className="p-2 font-medium">{m.name}</td>
                <td className="p-2 text-muted-foreground">{m.email}</td>
                <td className="p-2 text-muted-foreground">{m.phone}</td>
                <td className="p-2">{ROLE_LABELS[m.role as Role]}</td>
                <td className="p-2">
                  {m.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                </td>
                <td className="p-2 text-right">
                  <Link href={`/admin/members/${m.id}`} className="text-primary hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{members.length} member(s).</p>
    </div>
  );
}
