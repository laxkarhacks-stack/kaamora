import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin · Telegram" };

export default function AdminTelegramPage() {
  const enabled = process.env.ENABLE_TELEGRAM === "true";
  return (
    <Shell>
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Telegram</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification status</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              Status:{" "}
              <strong className={enabled ? "text-green-600" : "text-amber-600"}>
                {enabled ? "Enabled" : "Disabled (set ENABLE_TELEGRAM=true)"}
              </strong>
            </p>
            <p className="mt-2">
              Async only — failures never block user actions. Configure
              TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in env.
            </p>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
