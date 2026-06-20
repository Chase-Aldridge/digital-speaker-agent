import { Hono } from "hono";
import { db } from "../db.ts";
import { hashPassword, verifyPassword, signToken, requireAuth } from "../auth.ts";
import type { AppEnv } from "../types.ts";

export const authRoutes = new Hono<AppEnv>();

function publicUser(row: any) {
  return { id: row.id, email: row.email, name: row.name, plan: row.plan, createdAt: row.created_at };
}

authRoutes.post("/register", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();

  if (!email || !password || !name) {
    return c.json({ error: "Name, email, and password are required." }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: "Password must be at least 8 characters." }, 400);
  }

  const existing = db.query("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return c.json({ error: "An account with that email already exists." }, 409);

  const id = crypto.randomUUID();
  const hash = await hashPassword(password);
  db.query("INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)").run(
    id, email, hash, name,
  );
  db.query("INSERT INTO profiles (user_id) VALUES (?)").run(id);

  const token = await signToken(id);
  const user = db.query("SELECT * FROM users WHERE id = ?").get(id);
  return c.json({ token, user: publicUser(user) }, 201);
});

authRoutes.post("/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const row: any = db.query("SELECT * FROM users WHERE email = ?").get(email);
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return c.json({ error: "Invalid email or password." }, 401);
  }

  const token = await signToken(row.id);
  return c.json({ token, user: publicUser(row) });
});

authRoutes.get("/me", requireAuth, (c) => {
  const userId = c.get("userId");
  const row = db.query("SELECT * FROM users WHERE id = ?").get(userId);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ user: publicUser(row) });
});
