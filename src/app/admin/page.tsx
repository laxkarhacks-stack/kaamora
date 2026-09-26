import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata = { title: "Admin" };

const links = [
  { href: "/admin/apps", label: "Apps" },
  { href: "/admin/apps/create", label: "Create App" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/credits", label: "Credits" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/usage", label: "Usage History" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit Log" },
];

export default function AdminDashboardPage() {
  return (
    <Shell>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin Control Room</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Dashboard metrics use real database data once Supabase is connected
          (Phase 5).
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{l.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-indigo-600 dark:text-indigo-400">
                    Open →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
