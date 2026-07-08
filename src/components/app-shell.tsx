"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";

const ADMIN_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/id-cards", label: "ID Cards" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/income", label: "Income" },
  { href: "/admin/expenses", label: "Expenses" },
  { href: "/admin/dues", label: "Dues" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/notifications", label: "Notify" },
  { href: "/admin/polls", label: "Polls" },
  { href: "/admin/audit-log", label: "Audit" },
  { href: "/admin/backup", label: "Backup" },
];

const MEMBER_LINKS = [
  { href: "/member/dashboard", label: "Home" },
  { href: "/member/dues", label: "Dues" },
  { href: "/member/payments", label: "Payments" },
  { href: "/member/expenses", label: "Expenses" },
  { href: "/member/reports", label: "Reports" },
  { href: "/member/polls", label: "Polls" },
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
      <header className="border-b border-border/60 bg-card/60 backdrop-blur-xl sticky top-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
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
          <div className="ml-auto flex items-center gap-2 text-sm">
            <ThemeToggle />
            <NotificationBell />
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
      <footer className="border-t border-border/60 py-4 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Made with <span className="text-primary">♥</span> by{" "}
          <a
            href="https://apkutkarsh.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            apkutkarsh
          </a>
        </p>
      </footer>
    </div>
  );
}
