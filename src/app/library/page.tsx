"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CATEGORIES } from "@/lib/config";

type AppRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
};

export default function LibraryPage() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    setLoading(true);
    void fetch(`/api/apps?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not load apps");
          setApps([]);
          return;
        }
        setError(null);
        setApps(data.apps || []);
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [q, category]);

  return (
    <Shell>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">App library</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Opening an app is free. Credits only for paid actions.
          </p>
        </div>

        <input
          className="mb-4 h-10 w-full max-w-md rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-600 dark:bg-zinc-900"
          placeholder="Search apps…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              !category
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                category === cat
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-zinc-500">Loading…</p>}
        {error && <p className="text-sm text-amber-600">{error}</p>}

        {!loading && !error && apps.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No published apps yet</CardTitle>
              <CardDescription>
                Admin → Create App se HTML publish karo. Route: /apps/&lt;slug&gt;
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Link key={app.id} href={`/apps/${app.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{app.name}</CardTitle>
                  <CardDescription>
                    {app.category || "App"} · /apps/{app.slug}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {app.description || "Open app"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
