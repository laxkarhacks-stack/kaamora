import { Header } from "./header";
import { ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
  creditBalance?: number | null;
  userName?: string | null;
  hideHeader?: boolean;
}

export function Shell({
  children,
  creditBalance,
  userName,
  hideHeader,
}: ShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {!hideHeader && (
        <Header creditBalance={creditBalance} userName={userName} />
      )}
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        <p>© {new Date().getFullYear()} Kaamora · Browser-first tools</p>
      </footer>
    </div>
  );
}
