import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/config";

export const metadata = {
  title: "App library",
};

export default function LibraryPage() {
  return (
    <Shell>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            App library
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Standalone tools that run in your browser. Opening an app is free.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/library?category=${encodeURIComponent(cat)}`}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-600 dark:hover:text-indigo-300"
            >
              {cat}
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No apps yet</CardTitle>
            <CardDescription>
              Apps will appear here after admins publish them (Phase 4–5).
              The registry and standalone routes are defined in the foundation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Route pattern:{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
                /apps/&lt;slug&gt;
              </code>
            </p>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
