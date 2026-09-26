# Kaamora — implementation vs initial requirement

Deliver as full source. Env + SQL on Vercel/Supabase required for live auth/DB.

## Phase 1 Foundation
- Next/TS/Tailwind, shell, design system
- AuthProvider, middleware session refresh
- Header profile/balance/logout
- RequireAuth on credits (extend to profile/buy/history)
- Login/signup with credentials + redirect

## Phase 2 Core engine
- SQL schema + atomic credit RPCs
- Credit/Action/Trial/Events engines
- Authorize API, rate-limit helper

## Phase 3 Browser engine
- WorkerPool, file utils (foundation)

## Phase 4 HTML → App
- Analyzer, analyze/create APIs, admin create UI
- SDK, /apps/[slug]

## Phase 5 Admin
- Dashboard links, Create App, Apps list publish/disable/archive API

## Phase 6 User
- Home, library (live API), auth, profile, credits, buy, history
- Trial/insufficient credit dialogs components

## Phase 7 Payments + integrations
- Mock gateway create/verify, Telegram/GitHub helpers

## Phase 8
- Smoke test script; full automated suite still expand later

Fix what breaks after deploy.
