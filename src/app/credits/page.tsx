"use client";

import { Shell } from "@/components/layout/shell";
import { RequireAuth } from "@/components/auth/require-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

export default function CreditsPage() {
  const { balance } = useAuth();

  return (
    <Shell>
      <RequireAuth>
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight">Credits</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Opening apps and selecting files is free. Credits only for paid
            actions.
          </p>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Balance</CardTitle>
              <CardDescription>Server-authoritative</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <span className="text-3xl font-bold tabular-nums text-indigo-600">
                {typeof balance === "number" ? balance : "—"}
              </span>
              <Link href="/buy-credits">
                <Button>Buy credits</Button>
              </Link>
            </CardContent>
          </Card>
          <div className="mt-4">
            <Link href="/history" className="text-sm text-indigo-600 underline">
              Usage history
            </Link>
          </div>
        </div>
      </RequireAuth>
    </Shell>
  );
}
