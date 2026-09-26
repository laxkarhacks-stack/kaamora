import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = createServiceClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email, status, created_at, last_seen")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: credits } = await supabase.from("credits").select("user_id, balance");
  const bal = new Map((credits || []).map((c) => [c.user_id, c.balance]));

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {(profiles || []).length} profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(profiles || []).length === 0 && (
              <p className="text-sm text-zinc-500">No users yet.</p>
            )}
            {(profiles || []).map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700"
              >
                <div>
                  <p className="font-medium">{p.name || p.email || p.id.slice(0, 8)}</p>
                  <p className="text-xs text-zinc-500">
                    {p.email} · {p.status} · joined{" "}
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-semibold text-indigo-600">
                  {bal.get(p.id) ?? 0} cr
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
