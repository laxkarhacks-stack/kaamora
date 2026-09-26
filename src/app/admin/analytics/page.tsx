import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Analytics" };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = createServiceClient();
  const [
    { count: users },
    { count: apps },
    { count: usage },
    { count: payments },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("apps").select("*", { count: "exact", head: true }),
    supabase.from("usage_events").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Users", value: users ?? 0 },
    { label: "Apps", value: apps ?? 0 },
    { label: "Usage events", value: usage ?? 0 },
    { label: "Payments", value: payments ?? 0 },
  ];

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader>
                <CardTitle className="text-sm text-zinc-500">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  );
}
