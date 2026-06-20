import { Hono } from "hono";
import { db } from "../db.ts";
import { requireAuth } from "../auth.ts";
import { generatePitch } from "../ai.ts";
import { mapSubmission, type AppEnv } from "../types.ts";

export const submissionRoutes = new Hono<AppEnv>();
submissionRoutes.use("*", requireAuth);

const VALID_STATUS = [
  "saved",
  "drafted",
  "applied",
  "in_review",
  "accepted",
  "rejected",
];

const JOIN_SQL = `
  SELECT s.*,
    o.id AS opp_id, o.type AS opp_type, o.title AS opp_title, o.organization AS opp_organization,
    o.location AS opp_location, o.format AS opp_format, o.pay_model AS opp_pay_model,
    o.topics AS opp_topics, o.description AS opp_description, o.audience_size AS opp_audience_size,
    o.fee_offered AS opp_fee_offered, o.contact AS opp_contact, o.application_url AS opp_application_url,
    o.deadline AS opp_deadline, o.event_date AS opp_event_date, o.source AS opp_source,
    o.created_at AS opp_created_at
  FROM submissions s
  JOIN opportunities o ON o.id = s.opportunity_id
`;

// Dashboard stats. Declared before "/:id" routes (those are PATCH/DELETE so no
// real collision, but keep GETs grouped at the top).
submissionRoutes.get("/stats", (c) => {
  const userId = c.get("userId");
  const rows = db
    .query(
      "SELECT status, COUNT(*) AS n FROM submissions WHERE user_id = ? GROUP BY status",
    )
    .all(userId) as any[];

  const byStatus: Record<string, number> = {};
  for (const s of VALID_STATUS) byStatus[s] = 0;
  let total = 0;
  for (const r of rows) {
    byStatus[r.status] = r.n;
    total += r.n;
  }
  const availableOpps = (
    db
      .query(
        "SELECT COUNT(*) AS n FROM opportunities WHERE (discovered_by IS NULL OR discovered_by = ?)",
      )
      .get(userId) as any
  ).n;

  return c.json({
    stats: {
      total,
      byStatus,
      availableOpportunities: availableOpps,
      applied:
        byStatus.applied +
        byStatus.in_review +
        byStatus.accepted +
        byStatus.rejected,
      accepted: byStatus.accepted,
    },
  });
});

submissionRoutes.get("/", (c) => {
  const userId = c.get("userId");
  const rows = db
    .query(`${JOIN_SQL} WHERE s.user_id = ? ORDER BY s.updated_at DESC`)
    .all(userId) as any[];
  return c.json({ submissions: rows.map(mapSubmission) });
});

submissionRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const b = await c.req.json().catch(() => ({}));
  const opportunityId = String(b.opportunityId || "");
  if (!opportunityId)
    return c.json({ error: "opportunityId is required." }, 400);

  const opp = db
    .query("SELECT id FROM opportunities WHERE id = ?")
    .get(opportunityId);
  if (!opp) return c.json({ error: "Opportunity not found." }, 404);

  const existing: any = db
    .query(
      "SELECT id FROM submissions WHERE user_id = ? AND opportunity_id = ?",
    )
    .get(userId, opportunityId);

  let id: string;
  if (existing) {
    id = existing.id;
  } else {
    id = crypto.randomUUID();
    const status = VALID_STATUS.includes(b.status) ? b.status : "saved";
    db.query(
      "INSERT INTO submissions (id, user_id, opportunity_id, status, notes) VALUES (?, ?, ?, ?, ?)",
    ).run(id, userId, opportunityId, status, String(b.notes || ""));
  }

  const row = db.query(`${JOIN_SQL} WHERE s.id = ?`).get(id);
  return c.json({ submission: mapSubmission(row) }, existing ? 200 : 201);
});

submissionRoutes.patch("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const b = await c.req.json().catch(() => ({}));

  const cur: any = db
    .query("SELECT * FROM submissions WHERE id = ? AND user_id = ?")
    .get(id, userId);
  if (!cur) return c.json({ error: "Not found" }, 404);

  const status =
    b.status !== undefined && VALID_STATUS.includes(b.status)
      ? b.status
      : cur.status;
  const notes = b.notes !== undefined ? String(b.notes) : cur.notes;
  const pitch = b.pitch !== undefined ? String(b.pitch) : cur.pitch;
  // Stamp applied_at the first time the user marks it applied.
  const appliedAt =
    cur.applied_at ||
    (status !== "saved" && status !== "drafted"
      ? new Date().toISOString()
      : null);

  db.query(
    "UPDATE submissions SET status = ?, notes = ?, pitch = ?, applied_at = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(status, notes, pitch, appliedAt, id);

  const row = db.query(`${JOIN_SQL} WHERE s.id = ?`).get(id);
  return c.json({ submission: mapSubmission(row) });
});

submissionRoutes.delete("/:id", (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const res = db
    .query("DELETE FROM submissions WHERE id = ? AND user_id = ?")
    .run(id, userId);
  if (res.changes === 0) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});

// Generate (or regenerate) the tailored application for a tracked opportunity.
submissionRoutes.post("/:id/generate", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const sub: any = db
    .query(`${JOIN_SQL} WHERE s.id = ? AND s.user_id = ?`)
    .get(id, userId);
  if (!sub) return c.json({ error: "Not found" }, 404);

  const user: any = db.query("SELECT name FROM users WHERE id = ?").get(userId);
  const prof: any = db
    .query("SELECT * FROM profiles WHERE user_id = ?")
    .get(userId);

  const safe = (v: unknown, fb: any) => {
    try {
      return v == null ? fb : JSON.parse(v as string);
    } catch {
      return fb;
    }
  };

  const { pitch, source } = await generatePitch(
    {
      name: user?.name || "the speaker",
      headline: prof?.headline || "",
      bio: prof?.bio || "",
      topics: safe(prof?.topics, []),
      speakingHistory: safe(prof?.speaking_history, []),
      feeRange: prof?.fee_range || "",
      location: prof?.location || "",
    },
    {
      title: sub.opp_title,
      organization: sub.opp_organization,
      description: sub.opp_description,
      topics: safe(sub.opp_topics, []),
      format: sub.opp_format,
      audienceSize: sub.opp_audience_size,
    },
  );

  const nextStatus = sub.status === "saved" ? "drafted" : sub.status;
  db.query(
    "UPDATE submissions SET pitch = ?, status = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(pitch, nextStatus, id);

  const row = db.query(`${JOIN_SQL} WHERE s.id = ?`).get(id);
  return c.json({ submission: mapSubmission(row), source });
});
