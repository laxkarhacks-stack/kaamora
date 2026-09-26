"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { RequireAuth } from "@/components/auth/require-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AppRow = { id: string; name: string; slug: string; description?: string };

export default function FavoritesPage() {
  const [apps, setApps] = useState<AppRow[]>([]);

  useEffect(() => {
    fetch("/api/apps")
      .then((r) => r.json())
      .then((d) => setApps((d.apps || []).slice(0, 12)))
      .catch(() => {});
  }, []);

  return (
    <Shell>
      <RequireAuth>
        <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold">Favorites & Recent</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your apps</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {apps.length === 0 && (
                <p className="text-sm text-zinc-500">
                  Open apps from Library to see them here.
                </p>
              )}
              {apps.map((a) => (
                <Link
                  key={a.id}
                  href={`/apps/${a.slug}`}
                  className="rounded-xl border border-zinc-200 p-4 hover:border-indigo-400 dark:border-zinc-700"
                >
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-zinc-500">/apps/{a.slug}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    </Shell>
  );
}
