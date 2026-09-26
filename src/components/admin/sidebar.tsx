"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV: Array<{ href: string; label: string }> = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/apps", label: "All Apps" },
  { href: "/admin/apps/create", label: "Create App" },
  { href: "/admin/modules", label: "Modules" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/credits", label: "Credits" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/usage", label: "Usage History" },
  { href: "/admin/trial", label: "Trial" },
  { href: "/admin/security", label: "Abuse / Security" },
  { href: "/admin/telegram", label: "Telegram" },
  { href: "/admin/github", label: "GitHub" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit Log" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:w-56 sm:border-b-0 sm:border-r sm:min-h-[calc(100dvh-3.5rem)]">
      <nav className="flex gap-1 overflow-x-auto p-3 sm:flex-col sm:overflow-visible">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
