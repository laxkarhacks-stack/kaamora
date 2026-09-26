import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, CATEGORIES } from "@/lib/config";

export default function HomePage() {
  return (
    <Shell>
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="flex flex-col items-start gap-6 sm:gap-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Browser-first tools
            </p>
            <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              Process files on your device.
              <span className="block text-indigo-600 dark:text-indigo-400">
                {APP_NAME} handles the rest.
              </span>
            </h1>
            <p className="max-w-xl text-base text-zinc-600 dark:text-zinc-400">
              Discover standalone apps that run locally in your browser. Credits
              only when you use a paid action — viewing and selecting files is
              always free.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/library">
              <Button size="lg">Browse apps</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Create account
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.slice(0, 6).map((cat) => (
            <Link key={cat} href={`/library?category=${encodeURIComponent(cat)}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{cat}</CardTitle>
                  <CardDescription>
                    Tools for {cat.toLowerCase()} processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Explore →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            How it works
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">1. Open an app</strong>{" "}
              — free, no credit required.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">2. Process locally</strong>{" "}
              — files stay in your browser when possible.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-100">3. Pay only for actions</strong>{" "}
              — configured costs, server-authoritative credits.
            </li>
          </ol>
        </div>
      </section>
    </Shell>
  );
}
