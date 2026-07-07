import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { ADMIN_ROLES, type Role } from "@/lib/constants";

/** Ensures the user is logged in AND has one of `allowed` roles; otherwise redirects. */
export function requireRole(session: Session | null, allowed: readonly Role[]): Session {
  if (!session?.user) redirect("/login");
  const role = (session.user.role ?? "MEMBER") as Role;
  if (!allowed.includes(role)) {
    redirect(role === "MEMBER" ? "/member/dashboard" : "/admin/dashboard");
  }
  return session;
}

export const requireAdmin = (s: Session | null) => requireRole(s, ADMIN_ROLES);
export const requireSuper = (s: Session | null) => requireRole(s, ["SUPER_ADMIN"]);
