# Digital Speaker Agent: Handoff

Bootstrap doc for a fresh session working on this app. Read this top to bottom before changing code.

## TL;DR

- **What:** MVP of a platform for professional speakers. Find speaking gigs, auto generate applications in the speaker's voice, track bookings through a pipeline. Concept clone of digitalspeakeragent.com.
- **Live:** https://digitalspeaker.chasealdridge.com (deployed on Coolify).
- **Local code:** `~/github/digital-speaker-agent` (this repo). GitHub: `Chase-Aldridge/digital-speaker-agent` (public).
- **Run:** `bun install && bun run dev` (API on :3001, web on :5173).
- **Test/verify:** `bun run verify` (lint, typecheck, 30 tests, build).
- **Deploy:** push to `main`, then redeploy the Coolify app (see "Deploy").
- **Deploy IDs + secrets** (Coolify app uuid, server, DNS, WhatsApp): in the private memory file `project-digital-speaker-agent-deploy.md`. They are NOT in this repo because the repo is public.

## Read first: guardrails

1. **Do not touch the `speaking-sherpa` repo or its Coolify app.** That is Chase's separate, pre-existing Next.js + Supabase version of this product (private repo, `sherpa.chasealdridge.com`). This app (`digital-speaker-agent`) is a distinct, parallel build. Keep them separate.
2. **Preserve the design identity (see "Design system").** The whole point of this UI is that it does NOT look like a generic AI dark glassmorphism SaaS. Do not reintroduce: Inter font, purple/cyan gradient text, glassmorphism cards, dark-glow aurora backgrounds, or a centered hero with two gradient buttons. If a change pushes it back toward that look, stop and reconsider.
3. **Chase's writing rules (apply to all UI copy, docs, commits):** no em dashes (use periods or commas), no emojis unless asked, plain language at a 4th to 5th grade level for anything user facing. Word blacklist: delve, realm, unleash, tapestry, holistic, synthesize, paramount, empirical, transcend. Never fabricate names, testimonials, or stats.
4. **Confirm before outward facing actions** (sending messages, publishing, anything hard to reverse) unless Chase gave explicit standing approval for that specific action.
5. **Edit over delete.** Prefer surgical changes. For finished deliverables, new iterations over overwriting.

## What it is (product)

Three jobs, mapped to the nav:
1. **Opportunities** ("the board"): searchable, filterable directory of speaking gigs (seeded sample data).
2. **Applications**: from a reusable **Speaker Profile**, generate a tailored pitch + session title + abstract per gig. Uses the Anthropic SDK when `ANTHROPIC_API_KEY` is set, otherwise a deterministic template generator (so it always works offline).
3. **Broadcast Log** (pipeline): kanban from Queued to Booked, with status, notes, and the saved application on each card.

Plus: email/password auth, a Dashboard (pre-flight checklist, fresh-on-board preview, signal strength, pipeline levels), a Billing page (mock checkout unless Stripe keys are added), and a branded landing page.

## Architecture and stack

| Layer    | Tech                                                   |
| -------- | ----------------------------------------------------- |
| Frontend | React 18, Vite 6, Tailwind v4, React Router 6, TS     |
| Backend  | Bun + Hono                                             |
| Database | SQLite via `bun:sqlite`                                |
| Auth     | JWT (`jose`) + Bun password hashing                   |
| AI       | `@anthropic-ai/sdk`, template fallback                |

- Dev: Vite serves the SPA on :5173 and proxies `/api` to the Hono server on :3001.
- Prod: the Hono server serves the built SPA from `dist/` and the API from one process (`bun run start`), inside a Docker container (see `Dockerfile`).
- The API is mounted under `/api`. Auth is a Bearer JWT stored in `localStorage` (`dsa_token`).

## Repo map

```
server/                Hono API (Bun)
  index.ts             app wiring + static serving in prod (serves dist when NODE_ENV=production)
  db.ts                SQLite schema + auto-seed of opportunities
  auth.ts              password hashing, JWT sign/verify, requireAuth middleware
  ai.ts                pitch generation (Claude if key, else template)
  seed-data.ts         12 sample opportunities
  types.ts             row -> API mappers (snake_case DB to camelCase JSON)
  routes/              auth.ts, profile.ts, opportunities.ts, submissions.ts
src/                   React SPA
  pages/               Landing, Login, Register, Dashboard, Opportunities, Profile, Pipeline, Billing
  components/          Layout, AuthShell, Modal, Brand, icons.tsx, ui.tsx (primitives)
  lib/                 api.ts (fetch client), auth.tsx (context), types.ts, status.ts
  index.css            design tokens, fonts, textures, animations (the design system lives here)
tests/                 bun test suite (auth, ai, mappers, status, full API integration)
Dockerfile             single-stage Bun image used by Coolify
```

Data model (SQLite): `users`, `profiles` (1:1 with user), `opportunities` (seeded), `submissions` (user x opportunity, with status + saved pitch). See `server/db.ts`.

## Design system: "On-Air Broadcast"

The identity is a vintage radio/broadcast booth. This is deliberate and Chase-approved. Keep it cohesive.

- **Palette (tokens in `src/index.css` under `@theme`):** warm paper (`--color-paper*`), ink near-black (`--color-ink*`), broadcast red (`--color-signal`), amber (`--color-amber`), deep night for dark panels (`--color-night`). Light theme on warm paper, not white, not dark.
- **Type:** `Fraunces` (serif display, the star), `Hanken Grotesk` (body), `Space Mono` (console labels). Loaded in `index.html`. Mono labels use the `.label` class (uppercase, tracked).
- **Signature motifs:** animated ON-AIR lamp (`.lamp`/`.lamp-on`), VU meters (`<VuMeter>` in `ui.tsx`), a "NOW BOOKING" marquee, ticket-stub opportunity cards (perforated dashed edges), the pitch generator as a "REC" recording booth, call sign `DSA-FM 98.6`, paper grain + halftone textures.
- **Components:** printed-poster buttons and cards with hard offset shadows (`.card-pop`, the `Button` styles in `ui.tsx`). Status names are themed: Queued, Draft ready, On air, In review, Booked, Passed (`src/lib/status.ts`).
- **Primitives live in `src/components/ui.tsx`** (Button, Input, Textarea, Select, Field, Badge, Card, VuMeter, Spinner, EmptyState). Reuse these. Icons are in `src/components/icons.tsx` (stroke SVGs, no icon dependency).

If you add UI, build it from these primitives and tokens so it stays on brand.

## Local development

```bash
cd ~/github/digital-speaker-agent
bun install
cp .env.example .env     # optional; app runs fully without it
bun run dev              # API :3001 + web :5173 together
```

Open http://localhost:5173. Opportunities seed on first run. The app works with no env vars (AI uses the template generator, billing is mocked).

Optional `.env`: `ANTHROPIC_API_KEY` (live AI generation), `AI_MODEL` (default `claude-sonnet-4-6`), `JWT_SECRET`, `STRIPE_SECRET_KEY` / `STRIPE_PRICE_PRO`.

### Test, lint, build

```bash
bun run test        # 30 tests (auth, ai, mappers, status, full API integration)
bun run lint        # oxlint
bun run typecheck   # tsc --noEmit
bun run verify      # all of the above + production build (the gate before deploy)
```

Tests use an isolated temp DB and run the Hono app in-process via `app.request(...)`. Keep them green.

## Verifying in a real browser

Playwright (python) is installed. Reusable scripts live in `~/.claude/scratchpad/2026-06-20_dsa-verify/`:
- `e2e.py` drives the LOCAL prod build (register, profile, track, generate, pipeline, billing) and screenshots to `shots/`.
- `live_check.py` drives the LIVE site. The local WSL resolver can hold a stale cache for the domain, so it launches Chromium with `--host-resolver-rules=MAP <host> <origin-ip>` (real hostname for valid TLS, mapped to the origin IP). Use the same trick to screenshot or test production.

To screenshot the local app: `bun run build`, run `bun server/index.ts` with `NODE_ENV=production`, then point Playwright at it.

## Deploy

Hosted on **Coolify** (Chase's self-hosted PaaS). The app, server, project, DNS record, and Cloudflare/WAHA specifics are in the private memory `project-digital-speaker-agent-deploy.md`. Use the `coolify` CLI (context `cloud`) and the Coolify API token from `~/.config/coolify/config.json` (`instances[0].token`).

**Redeploy after a code change:**
```bash
cd ~/github/digital-speaker-agent
bun run verify           # do not deploy a red build
git add -A && git commit -m "..."   # end commits with Chase's Co-Authored-By line
git push                 # repo is public; Coolify clones over https
coolify deploy uuid <APP_UUID>       # APP_UUID is in the memory file
```
Then poll `coolify deploy get <DEPLOYMENT_UUID> --format json` until `finished`, and verify the live URL (curl `/api/health`, then a browser check via the host-resolver trick).

**Build details:** `build_pack=dockerfile`, root `Dockerfile`, container listens on port 3000 (`PORT=3000`, `NODE_ENV=production`). Coolify routes the domain to :3000 and issues the Let's Encrypt cert. DNS is DNS-only (grey cloud) so the cert can issue.

**Gotchas (learned the hard way):**
- The Cloudflare API token in `.env` is **D1 only, no Workers/Pages edit**. It CAN edit DNS. Full-stack apps go to Coolify, not Cloudflare Workers (Workers deploy needs interactive OAuth).
- Coolify is behind Cloudflare and blocks non-browser user agents with **error 1010**. Use `curl` for raw Coolify API calls, not python urllib.
- The Coolify env API rejects the field `is_build_time`. Use `{key, value, is_literal}`.

## Known follow-ups / backlog

- **Persistence:** SQLite is ephemeral (no volume). Data resets on redeploy. Add a Coolify persistent storage volume mounted at `/app/data` (the Dockerfile sets `DB_PATH=/app/data/dsa.sqlite`).
- **Live AI:** `ANTHROPIC_API_KEY` is intentionally not set on the deploy (so an open signup form cannot run up the bill). Add it in Coolify env to enable real Claude generation, ideally after adding signup limits.
- **Secret activation:** `JWT_SECRET` is set in Coolify but was added after the first deploy, so a redeploy activates it. There is also a **duplicate `JWT_SECRET` env entry** to clean up (delete one).
- **Private repo:** the GitHub repo is public so Coolify can clone it. To go private, connect a Coolify GitHub App source and switch the app to it.
- **Real opportunity data:** the board is seeded sample data. Real ingestion (CFP feeds, scrapers) is the obvious next feature.
- **Billing:** Stripe is mocked. Wire `STRIPE_SECRET_KEY` + price IDs and a checkout handler.

## Workflow for incorporating Vince's feedback

1. Read this doc and the project memory. Pull latest: `git pull`.
2. Capture Vince's feedback as a short list of concrete changes. If anything is ambiguous or subjective (especially visual), ask Chase before large rewrites.
3. Make changes on the local repo. Keep the design identity (guardrail 2) and writing rules (guardrail 3). Reuse `ui.tsx` primitives and `index.css` tokens.
4. Verify: `bun run verify`, then a browser check (e2e against the local prod build; screenshot and actually look at it).
5. Commit, push, redeploy (see "Deploy"), then verify the live URL works.
6. Only message anyone (Vince included) if Chase asks, and only after the change is verified live.

## Pointers

- Private memory (deploy IDs, secrets, history): `~/.claude/projects/-home-chase/memory/project-digital-speaker-agent-deploy.md`
- Verification scripts + screenshots: `~/.claude/scratchpad/2026-06-20_dsa-verify/`
- Product README: `README.md`
