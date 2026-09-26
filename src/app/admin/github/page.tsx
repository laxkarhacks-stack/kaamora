import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin · GitHub" };

export default function AdminGithubPage() {
  const enabled = process.env.ENABLE_GITHUB_SYNC === "true";
  return (
    <Shell>
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">GitHub Sync</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">HTML source sync</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              Status:{" "}
              <strong className={enabled ? "text-green-600" : "text-amber-600"}>
                {enabled ? "Enabled" : "Disabled (set ENABLE_GITHUB_SYNC=true)"}
              </strong>
            </p>
            <p className="mt-2">
              Original HTML remains source of truth. Sync failure must not
              half-publish an app. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO.
            </p>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
