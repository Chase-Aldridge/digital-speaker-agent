# Digital Speaker Agent — MVP

**More gigs. No grind.** A full-stack MVP of a platform for professional speakers:
find speaking opportunities, auto-generate tailored applications, and track every
submission through one pipeline.

This is a from-scratch rebuild of the product concept at digitalspeakeragent.com.

## What it does

1. **Discover.** The agent finds speaking and podcast opportunities matched to the speaker,
   not just a passive list. Search first by topic, kind (event or podcast), format, pay model,
   and location, then run Discover. Uses Claude when an API key is present, a deterministic
   generator otherwise. Discovered items are leads to verify, with how-to-reach contact info.
2. **Apply.** Generate a tailored application (pitch + session title + abstract) for any
   opportunity, built from the reusable speaker profile, and draft it in one step from the board.
3. **Track.** A kanban pipeline from *Saved* through *Accepted*, with status, notes, and the
   saved application text on every card.

Plus: email/password auth, a guided speaker-profile builder with an AI bio writer, a dashboard
with stats and deadline tracking, and a pricing/billing page (billing mocked unless Stripe keys
are set). Pay models cover events that pay you, free-to-speak slots, pay-to-speak, and paid
podcast placements.

## Stack

| Layer    | Tech                                                        |
| -------- | ---------------------------------------------------------- |
| Frontend | React 18, Vite 6, Tailwind v4, React Router, TypeScript    |
| Backend  | Bun + Hono                                                 |
| Database | SQLite (`bun:sqlite`)                                      |
| Auth     | JWT (`jose`) + Bun password hashing                       |
| AI       | Anthropic SDK (`@anthropic-ai/sdk`), template fallback    |

## Quick start

```bash
bun install
cp .env.example .env   # optional; the app runs without it
bun run dev            # API on :3001, web on :5173 (proxied)
```

Open http://localhost:5173, create an account, and you are in. The opportunities
directory is seeded automatically on first run.

### Optional configuration (`.env`)

- `ANTHROPIC_API_KEY` — turns on live AI application generation. Without it, a smart
  template generator is used.
- `JWT_SECRET` — set a long random string for production.
- `STRIPE_SECRET_KEY` / `STRIPE_PRICE_PRO` — wire real billing (mocked otherwise).

## Scripts

| Command            | What it does                                          |
| ------------------ | ---------------------------------------------------- |
| `bun run dev`      | Run API + web dev servers together                   |
| `bun run server`   | API only (watch mode)                                |
| `bun run client`   | Vite dev server only                                 |
| `bun run build`    | Build the frontend to `dist/`                        |
| `bun run start`    | Production: serve API + built SPA from one process   |
| `bun run seed`     | Force-reseed the opportunities table                 |
| `bun run lint`     | Lint with oxlint                                      |
| `bun run typecheck`| `tsc --noEmit`                                       |
| `bun run test`     | Unit + API integration tests (`bun test`)            |
| `bun run verify`   | lint → typecheck → test → build (the full gate)      |

## Tests

- **Unit** — password hashing & JWT, AI template generation, DB row mappers, date/status helpers.
- **Integration** — the full API surface (register, login, auth gating, profile, opportunity
  search/filter, idempotent tracking, pitch generation, status transitions, stats, delete)
  exercised in-process against an isolated temp database.

```bash
bun run test     # 30 tests across 5 files
```

## Project layout

```
server/            Hono API
  index.ts         app wiring + static serving in prod
  db.ts            SQLite schema + seeding
  auth.ts          password hashing, JWT, auth middleware
  ai.ts            pitch generation (Claude or template)
  routes/          auth, profile, opportunities, submissions
src/               React SPA
  pages/           Landing, Login, Register, Dashboard,
                   Opportunities, Profile, Pipeline, Billing
  components/       Layout, Modal, Brand, icons, ui primitives
  lib/             api client, auth context, types, status helpers
tests/             bun test suite
```

## Production

```bash
bun run build
bun run start      # serves API + dist/ on $PORT (default 3001)
```

## Notes / next steps

The MVP focuses on the platform. Natural follow-ons: real opportunity ingestion
(CFP feeds/scrapers), the browser-extension autofill, Stripe checkout + plan gating,
deadline-reminder emails, and a headshot/file upload pipeline.
