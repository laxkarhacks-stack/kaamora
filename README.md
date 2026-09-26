# Kaamora

Browser-first app platform. User device does compute; backend owns authority (auth, actions, credits, payments, admin).

## Locked architecture

- Routes: `/apps/<slug>` full-page standalone apps
- **No** iframe runtime, postMessage bridge, dual runtime, per-app backend, version-management UI
- Original HTML is source of truth
- SDK: `Kaamora.run("action", async () => { ... })`

## Quick start

See [docs/SETUP.md](docs/SETUP.md).

```bash
npm install
cp .env.example .env.local
# run SQL migrations in Supabase
npm run dev
```

Build: `npm run build -- --webpack`

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Supabase Auth/Postgres · Web Workers

## License

Proprietary
