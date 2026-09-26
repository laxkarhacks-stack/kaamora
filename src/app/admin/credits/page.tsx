import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin · Credits" };
export const dynamic = "force-dynamic";

export default async function AdminCreditsPage() {
  const supabase = createServiceClient();
  const { data: ledger } = await supabase
    .from("credit_ledger")
    .select("id, transaction_id, user_id, type, amount, balance_after, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: totals } = await supabase.from("credits").select("balance");
  const totalBalance = (totals || []).reduce((s, r) => s + (r.balance || 0), 0);

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Credits</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Platform-wide balance sum: <strong>{totalBalance}</strong>
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent ledger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(ledger || []).length === 0 && (
              <p className="text-sm text-zinc-500">No ledger entries yet.</p>
            )}
            {(ledger || []).map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700"
              >
                <div>
                  <p className="font-medium">
                    {e.type} · {e.amount > 0 ? "+" : ""}
                    {e.amount}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {e.user_id?.slice(0, 8)} · {e.status} ·{" "}
                    {new Date(e.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="font-semibold">bal {e.balance_after}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
