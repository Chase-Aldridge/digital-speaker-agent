import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import "./db.ts"; // opens the DB and seeds opportunities on first run
import { authRoutes } from "./routes/auth.ts";
import { profileRoutes } from "./routes/profile.ts";
import { opportunityRoutes } from "./routes/opportunities.ts";
import { submissionRoutes } from "./routes/submissions.ts";

export const app = new Hono();
app.use("*", logger());

const api = new Hono();
api.get("/health", (c) =>
  c.json({ ok: true, service: "digital-speaker-agent" }),
);
api.route("/auth", authRoutes);
api.route("/profile", profileRoutes);
api.route("/opportunities", opportunityRoutes);
api.route("/submissions", submissionRoutes);
app.route("/api", api);

api.notFound((c) => c.json({ error: "Not found" }, 404));

// In production the built SPA is served from ./dist with a catch-all fallback so
// client-side routes resolve. In dev, Vite serves the frontend and proxies /api.
if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ path: "./dist/index.html" }));
}

const port = Number(process.env.PORT || 3001);
console.log(`[dsa] API listening on http://localhost:${port}`);

export default { port, fetch: app.fetch };
