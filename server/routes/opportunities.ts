import { Hono } from "hono";
import { db } from "../db.ts";
import { requireAuth } from "../auth.ts";
import { mapOpportunity, type AppEnv } from "../types.ts";
import { discoverOpportunities, type DiscoverInput } from "../discover.ts";
import type { OppType, PayModel } from "../seed-data.ts";

export const opportunityRoutes = new Hono<AppEnv>();
opportunityRoutes.use("*", requireAuth);

// A user sees the shared seeded directory (discovered_by IS NULL) plus their own
// discovered leads. They never see another user's discovered leads.
const VISIBLE = "(discovered_by IS NULL OR discovered_by = ?)";

opportunityRoutes.get("/", (c) => {
  const userId = c.get("userId");
  const q = (c.req.query("q") || "").trim().toLowerCase();
  const format = (c.req.query("format") || "").trim();
  const topic = (c.req.query("topic") || "").trim().toLowerCase();
  const type = (c.req.query("type") || "").trim();
  const payModel = (c.req.query("payModel") || "").trim();
  const location = (c.req.query("location") || "").trim().toLowerCase();

  const where: string[] = [VISIBLE];
  const params: any[] = [userId];

  if (q) {
    where.push("(LOWER(title) LIKE ? OR LOWER(organization) LIKE ? OR LOWER(description) LIKE ? OR LOWER(topics) LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  if (type) {
    where.push("type = ?");
    params.push(type);
  }
  if (format) {
    where.push("format = ?");
    params.push(format);
  }
  if (payModel) {
    where.push("pay_model = ?");
    params.push(payModel);
  }
  if (location) {
    where.push("LOWER(location) LIKE ?");
    params.push(`%${location}%`);
  }
  if (topic) {
    where.push("LOWER(topics) LIKE ?");
    params.push(`%${topic}%`);
  }

  const sql = `SELECT * FROM opportunities WHERE ${where.join(" AND ")} ORDER BY date(deadline) ASC`;
  const rows = db.query(sql).all(...params) as any[];

  // Distinct topic list for filter UI, scoped to what this user can see.
  const allRows = db.query(`SELECT topics FROM opportunities WHERE ${VISIBLE}`).all(userId) as any[];
  const topicSet = new Set<string>();
  for (const r of allRows) {
    try {
      for (const t of JSON.parse(r.topics)) topicSet.add(t);
    } catch {}
  }

  return c.json({
    opportunities: rows.map(mapOpportunity),
    topics: [...topicSet].sort(),
  });
});

// Active discovery: research and store a fresh batch of leads for this speaker.
opportunityRoutes.post("/discover", async (c) => {
  const userId = c.get("userId");
  const b = await c.req.json().catch(() => ({}));

  const user: any = db.query("SELECT name FROM users WHERE id = ?").get(userId);
  const prof: any = db.query("SELECT * FROM profiles WHERE user_id = ?").get(userId);
  const safe = (v: unknown, fb: any) => {
    try {
      return v == null ? fb : JSON.parse(v as string);
    } catch {
      return fb;
    }
  };

  const asArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(String).filter(Boolean) : typeof v === "string" && v ? [v] : [];

  const input: DiscoverInput = {
    types: asArray(b.types).filter((t): t is OppType => t === "event" || t === "podcast"),
    topics: asArray(b.topics),
    location: typeof b.location === "string" ? b.location.trim() : "",
    openToTravel: !!b.openToTravel,
    payModels: asArray(b.payModels).filter((p): p is PayModel =>
      ["paid-opportunity", "free-to-speak", "paid-to-speak", "paid-to-pitch"].includes(p),
    ),
    count: Number(b.count) || 6,
    profile: {
      name: user?.name || "the speaker",
      headline: prof?.headline || "",
      topics: safe(prof?.topics, []),
      location: prof?.location || "",
    },
  };

  const { opportunities, source } = await discoverOpportunities(input);

  // Refresh this user's discovered feed: drop their previous leads that they
  // never tracked, then insert the new batch. Tracked leads (with a submission)
  // are preserved.
  db.query(
    `DELETE FROM opportunities
       WHERE discovered_by = ?
         AND id NOT IN (SELECT opportunity_id FROM submissions WHERE user_id = ?)`,
  ).run(userId, userId);

  const insert = db.prepare(`
    INSERT INTO opportunities
      (id, type, title, organization, location, format, pay_model, topics, description,
       audience_size, fee_offered, contact, application_url, deadline, event_date, source, discovered_by)
    VALUES
      ($id, $type, $title, $organization, $location, $format, $pay_model, $topics, $description,
       $audience_size, $fee_offered, $contact, $application_url, $deadline, $event_date, $source, $discovered_by)
  `);

  const ids: string[] = [];
  const tx = db.transaction(() => {
    for (const o of opportunities) {
      const id = `disc_${crypto.randomUUID()}`;
      ids.push(id);
      insert.run({
        $id: id,
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
        $discovered_by: userId,
      });
    }
  });
  tx();

  const rows = ids.length
    ? (db.query(`SELECT * FROM opportunities WHERE id IN (${ids.map(() => "?").join(",")})`).all(...ids) as any[])
    : [];

  return c.json({ opportunities: rows.map(mapOpportunity), source, count: rows.length });
});

opportunityRoutes.get("/:id", (c) => {
  const userId = c.get("userId");
  const row = db
    .query(`SELECT * FROM opportunities WHERE id = ? AND ${VISIBLE}`)
    .get(c.req.param("id"), userId);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ opportunity: mapOpportunity(row) });
});
