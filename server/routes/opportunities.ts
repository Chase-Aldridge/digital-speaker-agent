import { Hono } from "hono";
import { db } from "../db.ts";
import { requireAuth } from "../auth.ts";
import { mapOpportunity, type AppEnv } from "../types.ts";

export const opportunityRoutes = new Hono<AppEnv>();
opportunityRoutes.use("*", requireAuth);

opportunityRoutes.get("/", (c) => {
  const q = (c.req.query("q") || "").trim().toLowerCase();
  const format = (c.req.query("format") || "").trim();
  const topic = (c.req.query("topic") || "").trim().toLowerCase();

  const where: string[] = [];
  const params: any[] = [];

  if (q) {
    where.push("(LOWER(title) LIKE ? OR LOWER(organization) LIKE ? OR LOWER(description) LIKE ? OR LOWER(topics) LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  if (format) {
    where.push("format = ?");
    params.push(format);
  }
  if (topic) {
    where.push("LOWER(topics) LIKE ?");
    params.push(`%${topic}%`);
  }

  const sql =
    "SELECT * FROM opportunities" +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    " ORDER BY date(deadline) ASC";

  const rows = db.query(sql).all(...params) as any[];

  // Distinct topic list for filter UI.
  const allRows = db.query("SELECT topics FROM opportunities").all() as any[];
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

opportunityRoutes.get("/:id", (c) => {
  const row = db.query("SELECT * FROM opportunities WHERE id = ?").get(c.req.param("id"));
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ opportunity: mapOpportunity(row) });
});
