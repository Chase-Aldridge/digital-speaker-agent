import { Hono } from "hono";
import { db } from "../db.ts";
import { requireAuth } from "../auth.ts";
import { mapProfile, type AppEnv } from "../types.ts";
import { generateBio } from "../ai.ts";

export const profileRoutes = new Hono<AppEnv>();
profileRoutes.use("*", requireAuth);

const safe = (v: unknown, fb: any) => {
  try {
    return v == null ? fb : JSON.parse(v as string);
  } catch {
    return fb;
  }
};

profileRoutes.get("/", (c) => {
  const userId = c.get("userId");
  let row: any = db
    .query("SELECT * FROM profiles WHERE user_id = ?")
    .get(userId);
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

  db.query(
    `
    UPDATE profiles SET
      headline = ?, bio = ?, location = ?, phone = ?, website = ?,
      topics = ?, speaking_history = ?, fee_range = ?, video_url = ?,
      headshot_url = ?, social = ?, testimonials = ?, updated_at = datetime('now')
    WHERE user_id = ?
  `,
  ).run(
    str(b.headline),
    str(b.bio),
    str(b.location),
    str(b.phone),
    str(b.website),
    json(b.topics, "[]"),
    json(b.speakingHistory, "[]"),
    str(b.feeRange),
    str(b.videoUrl),
    str(b.headshotUrl),
    json(b.social, "{}"),
    json(b.testimonials, "[]"),
    userId,
  );

  const row = db.query("SELECT * FROM profiles WHERE user_id = ?").get(userId);
  return c.json({ profile: mapProfile(row) });
});

// Draft or rewrite the speaker bio from the profile. Accepts unsaved edits in
// the body so the page can generate from what the user is currently typing.
// Does not save; the client sets the bio field and the user saves.
profileRoutes.post("/generate-bio", async (c) => {
  const userId = c.get("userId");
  const b = await c.req.json().catch(() => ({}));
  const user: any = db.query("SELECT name FROM users WHERE id = ?").get(userId);
  const prof: any = db
    .query("SELECT * FROM profiles WHERE user_id = ?")
    .get(userId);

  const { bio, source } = await generateBio({
    name: user?.name || "the speaker",
    headline:
      b.headline !== undefined ? String(b.headline) : prof?.headline || "",
    topics:
      b.topics !== undefined
        ? Array.isArray(b.topics)
          ? b.topics.map(String)
          : []
        : safe(prof?.topics, []),
    speakingHistory:
      b.speakingHistory !== undefined
        ? Array.isArray(b.speakingHistory)
          ? b.speakingHistory
          : []
        : safe(prof?.speaking_history, []),
    feeRange:
      b.feeRange !== undefined ? String(b.feeRange) : prof?.fee_range || "",
    location:
      b.location !== undefined ? String(b.location) : prof?.location || "",
    currentBio: b.bio !== undefined ? String(b.bio) : prof?.bio || "",
  });

  return c.json({ bio, source });
});
