"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/layout/shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Row = {
  id: string;
  action: string | null;
  credits: number;
  result: string | null;
  created_at: string;
  app_id: string | null;
};

export default function HistoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/usage/me");
        if (!res.ok) {
          setError("Login required to view history");
          return;
        }
        const data = await res.json();
        setRows(data.events || []);
      } catch {
        setError("Network error");
      }
    })();
  }, []);

  return (
    <Shell>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Usage history</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Actions and credit changes on your account.
        </p>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent</CardTitle>
            <CardDescription>Most recent first</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="text-sm text-amber-600">{error}</p>}
            {!error && rows.length === 0 && (
              <p className="text-sm text-zinc-500">No usage yet.</p>
            )}
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <span className="font-medium">{r.action || "event"}</span>
                  <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                    {r.credits ? `${r.credits > 0 ? "+" : ""}${r.credits} cr` : "—"}
                  </span>
                  <span className="w-full text-xs text-zinc-500 sm:w-auto">
                    {new Date(r.created_at).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
