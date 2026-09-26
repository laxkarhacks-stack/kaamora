# Kaamora — full working source (all phases wired)

Deliver as complete source zip. Env + SQL on Vercel/Supabase required for live auth/DB.

## Phase 1 Foundation
- Next.js 16 / React 19 / TS / Tailwind 4 shell + design system
- AuthProvider, middleware session refresh
- Header profile icon / balance / logout menu
- RequireAuth on protected pages
- Login/signup with credentials + hard redirect

## Phase 2 Core engine
- SQL schema + atomic credit RPCs (idempotent)
- Credit / Action / Trial / Events engines
- Authorize + result APIs, rate-limit helper

## Phase 3 Browser engine
- WorkerPool foundation, file utils (Blob/ArrayBuffer/Streams)

## Phase 4 HTML → App
- Analyzer, analyze/create APIs, admin create UI
- SDK (`Kaamora.run`), `/apps/[slug]` full-page (no iframe)

## Phase 5 Admin
- Dashboard, Apps list publish/disable/archive
- Users, Credits ledger, Payments, Usage, Trial, Audit
- Analytics counts, Modules, Settings, Security, Telegram, GitHub

## Phase 6 User
- Home, Library (live API), Auth, Profile, Credits, Buy, History, Favorites

## Phase 7 Payments + integrations
- Mock gateway create/verify (server-side), Telegram + GitHub helpers

## Phase 8
- Analyzer smoke test; expand suite later

After deploy: set env vars, run both SQL migrations, test signup → login → profile icon in header.
