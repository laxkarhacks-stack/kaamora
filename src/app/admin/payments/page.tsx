import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Payments" };
export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const supabase = createServiceClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, order_id, user_id, amount, credits, gateway, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(payments || []).length === 0 && (
              <p className="text-sm text-zinc-500">No payments yet.</p>
            )}
            {(payments || []).map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700"
              >
                <div>
                  <p className="font-medium">
                    {p.order_id} · ₹{p.amount} → {p.credits} cr
                  </p>
                  <p className="text-xs text-zinc-500">
                    {p.gateway} · {p.status} ·{" "}
                    {new Date(p.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
