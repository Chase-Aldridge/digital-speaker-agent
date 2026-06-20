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
  type            TEXT NOT NULL DEFAULT 'event',
  title           TEXT NOT NULL,
  organization    TEXT NOT NULL,
  location        TEXT NOT NULL DEFAULT '',
  format          TEXT NOT NULL DEFAULT 'in-person',
  pay_model       TEXT NOT NULL DEFAULT '',
  topics          TEXT NOT NULL DEFAULT '[]',
  description     TEXT NOT NULL DEFAULT '',
  audience_size   TEXT NOT NULL DEFAULT '',
  fee_offered     TEXT NOT NULL DEFAULT '',
  contact         TEXT NOT NULL DEFAULT '',
  application_url TEXT NOT NULL DEFAULT '',
  deadline        TEXT,
  event_date      TEXT,
  source          TEXT NOT NULL DEFAULT '',
  discovered_by   TEXT,
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

// ---- Migration --------------------------------------------------------------
// Older databases created before podcasts/pay-model/discovery were added are
// upgraded in place. Adding a column is non-destructive, so tracked submissions
// and user data are preserved.
function ensureColumns(
  table: string,
  columns: { name: string; ddl: string }[],
) {
  const existing = new Set(
    (db.query(`PRAGMA table_info(${table})`).all() as { name: string }[]).map(
      (r) => r.name,
    ),
  );
  for (const col of columns) {
    if (!existing.has(col.name)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${col.ddl}`);
    }
  }
}

ensureColumns("opportunities", [
  { name: "type", ddl: "type TEXT NOT NULL DEFAULT 'event'" },
  { name: "pay_model", ddl: "pay_model TEXT NOT NULL DEFAULT ''" },
  { name: "contact", ddl: "contact TEXT NOT NULL DEFAULT ''" },
  { name: "discovered_by", ddl: "discovered_by TEXT" },
]);

// Created after the migration so the column exists on upgraded databases.
db.exec(
  "CREATE INDEX IF NOT EXISTS idx_opportunities_discovered ON opportunities(discovered_by);",
);

// ---- Seeding ----------------------------------------------------------------
// Idempotent upsert: insert new sample opportunities and refresh existing ones
// in place (ON CONFLICT updates, never deletes, so submissions are never
// cascade-removed). Safe to run on every boot.
export function seedOpportunities() {
  const insert = db.prepare(`
    INSERT INTO opportunities
      (id, type, title, organization, location, format, pay_model, topics, description,
       audience_size, fee_offered, contact, application_url, deadline, event_date, source)
    VALUES
      ($id, $type, $title, $organization, $location, $format, $pay_model, $topics, $description,
       $audience_size, $fee_offered, $contact, $application_url, $deadline, $event_date, $source)
    ON CONFLICT(id) DO UPDATE SET
      type = excluded.type,
      title = excluded.title,
      organization = excluded.organization,
      location = excluded.location,
      format = excluded.format,
      pay_model = excluded.pay_model,
      topics = excluded.topics,
      description = excluded.description,
      audience_size = excluded.audience_size,
      fee_offered = excluded.fee_offered,
      contact = excluded.contact,
      application_url = excluded.application_url,
      deadline = excluded.deadline,
      event_date = excluded.event_date,
      source = excluded.source
  `);

  const tx = db.transaction((rows: typeof SAMPLE_OPPORTUNITIES) => {
    for (const o of rows) {
      insert.run({
        $id: o.id,
        $type: o.type,
        $title: o.title,
        $organization: o.organization,
        $location: o.location,
        $format: o.format,
        $pay_model: o.payModel,
        $topics: JSON.stringify(o.topics),
        $description: o.description,
        $audience_size: o.audienceSize,
        $fee_offered: o.feeOffered,
        $contact: o.contact,
        $application_url: o.applicationUrl,
        $deadline: o.deadline,
        $event_date: o.eventDate,
        $source: o.source,
      });
    }
  });
  tx(SAMPLE_OPPORTUNITIES);
  return SAMPLE_OPPORTUNITIES.length;
}

// Auto-seed on import so the app is never empty and new sample rows land on boot.
seedOpportunities();

// Allow `bun run server/db.ts --seed` to force a reseed.
if (import.meta.main && process.argv.includes("--seed")) {
  const n = seedOpportunities();
  console.log(`Seeded ${n} opportunities into ${DB_PATH}`);
}
