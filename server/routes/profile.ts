import { Hono } from "hono";
import { db } from "../db.ts";
import { requireAuth } from "../auth.ts";
import { mapProfile, type AppEnv } from "../types.ts";

export const profileRoutes = new Hono<AppEnv>();
profileRoutes.use("*", requireAuth);

profileRoutes.get("/", (c) => {
  const userId = c.get("userId");
  let row: any = db.query("SELECT * FROM profiles WHERE user_id = ?").get(userId);
  if (!row) {
    db.query("INSERT INTO profiles (user_id) VALUES (?)").run(userId);
    row = db.query("SELECT * FROM profiles WHERE user_id = ?").get(userId);
  }
  return c.json({ profile: mapProfile(row) });
});

profileRoutes.put("/", async (c) => {
  const userId = c.get("userId");
  const b = await c.req.json().catch(() => ({}));

  const str = (v: unknown) => (v == null ? "" : String(v));
  const json = (v: unknown, fallback: string) => {
    try {
      return v == null ? fallback : JSON.stringify(v);
    } catch {
      return fallback;
    }
  };

  db.query(`
    UPDATE profiles SET
      headline = ?, bio = ?, location = ?, phone = ?, website = ?,
      topics = ?, speaking_history = ?, fee_range = ?, video_url = ?,
      headshot_url = ?, social = ?, testimonials = ?, updated_at = datetime('now')
    WHERE user_id = ?
  `).run(
    str(b.headline), str(b.bio), str(b.location), str(b.phone), str(b.website),
    json(b.topics, "[]"), json(b.speakingHistory, "[]"), str(b.feeRange), str(b.videoUrl),
    str(b.headshotUrl), json(b.social, "{}"), json(b.testimonials, "[]"),
    userId,
  );

  const row = db.query("SELECT * FROM profiles WHERE user_id = ?").get(userId);
  return c.json({ profile: mapProfile(row) });
});
