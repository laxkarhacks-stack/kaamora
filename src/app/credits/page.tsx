import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Credits" };

export default function CreditsPage() {
  return (
    <Shell>
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Credits</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Opening apps and selecting files is free. Credits are used only for
          configured actions.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Balance</CardTitle>
            <CardDescription>
              Sign in to see your live balance (Phase 2 auth + credit engine).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <span className="text-3xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
              —
            </span>
            <Link href="/auth/login">
              <Button>Log in</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Buy credits</CardTitle>
            <CardDescription>
              Payment packages and server-side verification land in Phase 7.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled variant="secondary">
              Coming soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
