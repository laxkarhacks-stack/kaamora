# Kaamora setup

## 1. Prerequisites

- Node 20+
- npm 10+
- Supabase project (Auth + Postgres)

## 2. Install

```bash
npm config set registry https://registry.npmjs.org/
npm install
cp .env.example .env.local
```

Fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

Optional:

- `GITHUB_*` for HTML sync
- `TELEGRAM_*` for notifications
- `PAYMENT_*` for real gateway (default mock)

## 3. Database

In Supabase SQL editor run in order:

1. `supabase/migrations/001_foundation.sql`
2. `supabase/migrations/002_credit_functions.sql`

Enable Auth email provider.

## 4. Run

```bash
npm run dev
```

Build (webpack, Termux-compatible):

```bash
npm run build -- --webpack
```

## 5. Architecture reminders

- Apps: `/apps/<slug>` full page — **no iframe runtime**
- Credits: server-authoritative, atomic, idempotent
- Payments: verify server-side only
- Telegram failure must not break user ops
- GitHub sync failure must not half-publish

## 6. GitHub

Do not commit `.env.local` or service keys.
Push the repo after verifying `npm run build` and migrations.
