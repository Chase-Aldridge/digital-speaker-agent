import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { SAMPLE_OPPORTUNITIES } from "./seed-data.ts";

const DB_PATH = process.env.DB_PATH || "data/dsa.sqlite";
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH, { create: true });
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// ---- Schema -----------------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id          TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline         TEXT NOT NULL DEFAULT '',
  bio              TEXT NOT NULL DEFAULT '',
  location         TEXT NOT NULL DEFAULT '',
  phone            TEXT NOT NULL DEFAULT '',
  website          TEXT NOT NULL DEFAULT '',
  topics           TEXT NOT NULL DEFAULT '[]',
  speaking_history TEXT NOT NULL DEFAULT '[]',
  fee_range        TEXT NOT NULL DEFAULT '',
  video_url        TEXT NOT NULL DEFAULT '',
  headshot_url     TEXT NOT NULL DEFAULT '',
  social           TEXT NOT NULL DEFAULT '{}',
  testimonials     TEXT NOT NULL DEFAULT '[]',
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS opportunities (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  organization    TEXT NOT NULL,
  location        TEXT NOT NULL DEFAULT '',
  format          TEXT NOT NULL DEFAULT 'in-person',
  topics          TEXT NOT NULL DEFAULT '[]',
  description     TEXT NOT NULL DEFAULT '',
  audience_size   TEXT NOT NULL DEFAULT '',
  fee_offered     TEXT NOT NULL DEFAULT '',
  application_url TEXT NOT NULL DEFAULT '',
  deadline        TEXT,
  event_date      TEXT,
  source          TEXT NOT NULL DEFAULT '',
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id  TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'saved',
  pitch           TEXT NOT NULL DEFAULT '',
  notes           TEXT NOT NULL DEFAULT '',
  applied_at      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
`);

// ---- Seeding ----------------------------------------------------------------
export function seedOpportunities(force = false) {
  const count = (db.query("SELECT COUNT(*) AS n FROM opportunities").get() as { n: number }).n;
  if (count > 0 && !force) return count;

  if (force) db.exec("DELETE FROM opportunities");

  const insert = db.prepare(`
    INSERT INTO opportunities
      (id, title, organization, location, format, topics, description,
       audience_size, fee_offered, application_url, deadline, event_date, source)
    VALUES
      ($id, $title, $organization, $location, $format, $topics, $description,
       $audience_size, $fee_offered, $application_url, $deadline, $event_date, $source)
  `);

  const tx = db.transaction((rows: typeof SAMPLE_OPPORTUNITIES) => {
    for (const o of rows) {
      insert.run({
        $id: o.id,
        $title: o.title,
        $organization: o.organization,
        $location: o.location,
        $format: o.format,
        $topics: JSON.stringify(o.topics),
        $description: o.description,
        $audience_size: o.audience_size,
        $fee_offered: o.fee_offered,
        $application_url: o.application_url,
        $deadline: o.deadline,
        $event_date: o.event_date,
        $source: o.source,
      });
    }
  });
  tx(SAMPLE_OPPORTUNITIES);
  return SAMPLE_OPPORTUNITIES.length;
}

// Auto-seed on import so the app is never empty in dev.
seedOpportunities(false);

// Allow `bun run server/db.ts --seed` to force a reseed.
if (import.meta.main && process.argv.includes("--seed")) {
  const n = seedOpportunities(true);
  console.log(`Seeded ${n} opportunities into ${DB_PATH}`);
}
