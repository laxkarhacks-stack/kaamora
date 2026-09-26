"use client";

import { ReactNode } from "react";
import { Button } from "./button";

export function Dialog({
  open,
  title,
  children,
  onClose,
  primaryLabel,
  onPrimary,
  secondaryLabel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {children}
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {secondaryLabel || "Close"}
          </Button>
          {primaryLabel && onPrimary && (
            <Button onClick={onPrimary}>{primaryLabel}</Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function InsufficientCreditsDialog({
  open,
  onClose,
  cost,
}: {
  open: boolean;
  onClose: () => void;
  cost?: number;
}) {
  return (
    <Dialog
      open={open}
      title="Insufficient credits"
      onClose={onClose}
      primaryLabel="Buy credits"
      onPrimary={() => {
        window.location.href = "/buy-credits";
      }}
      secondaryLabel="Cancel"
    >
      <p>
        Is action ke liye{typeof cost === "number" ? ` ${cost}` : ""} credit
        chahiye. Balance kam hai.
      </p>
    </Dialog>
  );
}

export function TrialExhaustedDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      title="Free trial used"
      onClose={onClose}
      primaryLabel="Log in"
      onPrimary={() => {
        window.location.href = "/auth/login";
      }}
      secondaryLabel="Close"
    >
      <p>
        Anonymous trial khatam. Login ya account banao taaki credits se continue
        kar sako.
      </p>
      <p className="mt-2">
        <a href="/auth/signup" className="text-indigo-600 underline">
          Create account
        </a>
      </p>
    </Dialog>
  );
}
