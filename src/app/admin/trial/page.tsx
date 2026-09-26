import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Trial" };
export const dynamic = "force-dynamic";

export default async function AdminTrialPage() {
  const supabase = createServiceClient();
  const { data: trials } = await supabase
    .from("trials")
    .select("id, visitor_key, user_id, usage_count, allowance, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Trial</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trial records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(trials || []).length === 0 && (
              <p className="text-sm text-zinc-500">No trial records.</p>
            )}
            {(trials || []).map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700"
              >
                <p className="font-medium">
                  {t.usage_count}/{t.allowance} used
                </p>
                <p className="text-xs text-zinc-500">
                  {t.user_id ? `user ${t.user_id.slice(0, 8)}` : t.visitor_key || "—"} ·{" "}
                  {new Date(t.updated_at).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
