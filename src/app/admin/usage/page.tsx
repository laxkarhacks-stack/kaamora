import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Usage" };
export const dynamic = "force-dynamic";

export default async function AdminUsagePage() {
  const supabase = createServiceClient();
  const { data: events } = await supabase
    .from("usage_events")
    .select("id, user_id, session_id, app_id, action, result, credits, created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Usage History</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(events || []).length === 0 && (
              <p className="text-sm text-zinc-500">No usage yet.</p>
            )}
            {(events || []).map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700"
              >
                <p className="font-medium">
                  {e.action || "—"} · {e.result || "—"} · {e.credits} cr
                </p>
                <p className="text-xs text-zinc-500">
                  user {e.user_id?.slice(0, 8) || "anon"} ·{" "}
                  {new Date(e.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
