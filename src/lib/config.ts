/**
 * Platform configuration — server-safe defaults.
 * Secrets must only be read server-side.
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Kaamora";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const CATEGORIES = [
  "Documents",
  "PDF",
  "Images",
  "AI",
  "Audio",
  "Video",
  "Utilities",
  "Processing",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Default trial / credit policy (overridable via admin settings later) */
export const DEFAULTS = {
  anonymousTrialAllowance: Number(
    process.env.ANONYMOUS_TRIAL_ALLOWANCE || 1
  ),
  accountTrialBonusCredits: Number(
    process.env.ACCOUNT_TRIAL_BONUS_CREDITS || 0
  ),
  testWalletCredits: 10,
  defaultActionCost: 1,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 60),
} as const;

export const FEATURES = {
  githubSync: process.env.ENABLE_GITHUB_SYNC === "true",
  telegram: process.env.ENABLE_TELEGRAM === "true",
  payments: process.env.ENABLE_PAYMENTS === "true",
} as const;
