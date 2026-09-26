"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

interface HeaderProps {
  creditBalance?: number | null;
  userName?: string | null;
  className?: string;
}

export function Header({ creditBalance, userName, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
            K
          </span>
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/library"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Apps
          </Link>

          {typeof creditBalance === "number" ? (
            <Link
              href="/credits"
              className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            >
              {creditBalance} cr
            </Link>
          ) : null}

          {userName ? (
            <Link
              href="/profile"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {userName.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
