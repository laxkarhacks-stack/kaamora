import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin · Settings" };

export default function AdminSettingsPage() {
  const flags = [
    { key: "ENABLE_GITHUB_SYNC", desc: "Sync HTML from GitHub on publish" },
    { key: "ENABLE_TELEGRAM", desc: "Async Telegram notifications" },
    { key: "ENABLE_PAYMENTS", desc: "Live payment gateway (else mock)" },
  ];

  return (
    <Shell>
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feature flags (env)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              Controlled via environment variables on Vercel / host. No runtime
              UI toggles to keep secrets server-only.
            </p>
            {flags.map((f) => (
              <div
                key={f.key}
                className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700"
              >
                <p className="font-mono text-xs font-semibold">{f.key}</p>
                <p className="text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
