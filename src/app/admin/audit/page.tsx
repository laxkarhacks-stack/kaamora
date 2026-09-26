import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Audit" };
export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const supabase = createServiceClient();
  const { data: logs } = await supabase
    .from("audit_log")
    .select("id, admin_id, action, old_value, new_value, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(logs || []).length === 0 && (
              <p className="text-sm text-zinc-500">No audit entries yet.</p>
            )}
            {(logs || []).map((l) => (
              <div
                key={l.id}
                className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700"
              >
                <p className="font-medium">{l.action}</p>
                <p className="text-xs text-zinc-500">
                  admin {l.admin_id.slice(0, 8)} ·{" "}
                  {new Date(l.created_at).toLocaleString()}
                  {l.reason ? ` · ${l.reason}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
