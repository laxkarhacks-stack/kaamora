import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin · Security" };

export default function AdminSecurityPage() {
  return (
    <Shell>
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Abuse / Security</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>• Rate limiting on authorize & auth endpoints</p>
            <p>• X-Frame-Options DENY + nosniff middleware headers</p>
            <p>• Server-only service role; no client secret exposure</p>
            <p>• Idempotency keys for credit deductions</p>
            <p>• Profile status: active / disabled / suspended</p>
            <p className="pt-2 text-xs">
              Blocked sessions and IP lists can be extended via security events
              table in a later migration.
            </p>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
