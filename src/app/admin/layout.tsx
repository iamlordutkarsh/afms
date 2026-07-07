import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/rbac";
import { AppShell } from "@/components/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = requireAdmin(await auth());
  return (
    <AppShell role={session.user.role} name={session.user.name ?? ""}>
      {children}
    </AppShell>
  );
}
