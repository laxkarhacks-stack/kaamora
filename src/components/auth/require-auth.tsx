"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, type ReactNode } from "react";
import Link from "next/link";

/** Client guard for protected pages (profile, credits, buy, history). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // soft: show message; optional hard redirect:
      // window.location.href = "/auth/login";
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md flex-1 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Login required</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Is page ke liye account chahiye.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          Log in
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
