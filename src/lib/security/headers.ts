/**
 * Security headers baseline for Kaamora.
 * Applied via next.config / middleware.
 */

export const securityHeaders: Record<string, string> = {
  "X-DNS-Prefetch-Control": "on",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "X-XSS-Protection": "1; mode=block",
};

/**
 * CSP notes:
 * - Imported HTML apps run as standalone full-page routes.
 * - We do NOT use iframes.
 * - CSP for /apps/* will be relaxed carefully in Phase 4 so
 *   legitimate app scripts can run while still blocking
 *   obvious escape vectors. Global CSP remains strict.
 */
export const strictCSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";
