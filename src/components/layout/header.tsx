"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

export function Header({ className }: { className?: string }) {
  const { user, balance, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName =
    user?.name?.split(" ")[0] || user?.email?.split("@")[0] || null;

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
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Apps
          </Link>

          {!loading && typeof balance === "number" && (
            <Link
              href="/credits"
              className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            >
              {balance} cr
            </Link>
          )}

          {loading ? (
            <span className="px-3 py-1.5 text-sm text-zinc-400">…</span>
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium dark:bg-zinc-800"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {(displayName || "U").charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[100px] truncate sm:inline">
                  {displayName}
                </span>
              </button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    aria-label="Close"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <Link href="/credits" className="block px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>Credits</Link>
                    <Link href="/buy-credits" className="block px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>Buy credits</Link>
                    <Link href="/history" className="block px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>History</Link>
                    <button type="button" className="block w-full px-4 py-2 text-left text-sm text-red-600" onClick={() => { setMenuOpen(false); void logout(); }}>
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
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
