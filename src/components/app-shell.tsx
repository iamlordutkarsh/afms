"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ROLE_LABELS, type Role } from "@/lib/constants";

const ADMIN_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/income", label: "Income" },
  { href: "/admin/expenses", label: "Expenses" },
  { href: "/admin/dues", label: "Dues" },
  { href: "/admin/reports", label: "Reports" },
];

const MEMBER_LINKS = [
  { href: "/member/dashboard", label: "Home" },
  { href: "/member/dues", label: "Dues" },
  { href: "/member/payments", label: "Payments" },
  { href: "/member/profile", label: "Profile" },
];

export function AppShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = role !== "MEMBER";
  const links = isAdmin ? ADMIN_LINKS : MEMBER_LINKS;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 flex h-14 items-center gap-6">
          <Link href={isAdmin ? "/admin/dashboard" : "/member/dashboard"} className="font-semibold tracking-tight">
            AFMS
          </Link>
          <nav className="flex items-center gap-4 text-sm overflow-x-auto">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  pathname === l.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-muted-foreground hidden sm:inline">
              {name} · {ROLE_LABELS[role]}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
