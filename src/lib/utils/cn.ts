/**
 * Lightweight className merger without external deps.
 * Sufficient for Phase 1; can switch to clsx + tailwind-merge later.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
