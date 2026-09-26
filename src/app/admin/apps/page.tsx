"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RequireAuth } from "@/components/auth/require-auth";

type AppRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  category: string | null;
};

export default function AdminAppsPage() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/apps");
    const data = await res.json();
    if (res.ok) setApps(data.apps || []);
    else setMsg(data.error || "Failed to load");
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: string, status: string) {
    setMsg(null);
    const res = await fetch("/api/admin/apps", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Update failed");
      return;
    }
    void load();
  }

  return (
    <Shell>
      <RequireAuth>
        <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Apps</h1>
            <Link href="/admin/apps/create">
              <Button>Create App</Button>
            </Link>
          </div>
          {msg && <p className="text-sm text-amber-600">{msg}</p>}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All apps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {apps.length === 0 && (
                <p className="text-sm text-zinc-500">No apps yet.</p>
              )}
              {apps.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-zinc-500">
                      /apps/{a.slug} · {a.status} · {a.category || "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/apps/${a.slug}`}
                      className="text-sm text-indigo-600"
                    >
                      Open
                    </Link>
                    {a.status !== "published" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setStatus(a.id, "published")}
                      >
                        Publish
                      </Button>
                    )}
                    {a.status === "published" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus(a.id, "disabled")}
                      >
                        Disable
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setStatus(a.id, "archived")}
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    </Shell>
  );
}
