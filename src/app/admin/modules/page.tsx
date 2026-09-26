import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Modules" };
export const dynamic = "force-dynamic";

export default async function AdminModulesPage() {
  const supabase = createServiceClient();
  const { data: modules } = await supabase
    .from("modules")
    .select("id, name, category, description, availability")
    .order("name");

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Modules</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catalog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(modules || []).length === 0 && (
              <p className="text-sm text-zinc-500">
                No modules seeded yet. Analyzer will register detections on
                import.
              </p>
            )}
            {(modules || []).map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700"
              >
                <p className="font-medium">
                  {m.name}{" "}
                  <span className="text-xs text-zinc-500">({m.category})</span>
                </p>
                <p className="text-xs text-zinc-500">
                  {m.description || "—"} ·{" "}
                  {m.availability ? "available" : "disabled"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
