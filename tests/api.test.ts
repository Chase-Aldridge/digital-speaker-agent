import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { rmSync } from "node:fs";

// Use an isolated temp DB. Must be set BEFORE the app (and db) module is imported,
// so the app is pulled in dynamically inside beforeAll.
const DB_FILE = `data/test-${Date.now()}-${Math.floor(Math.random() * 1e6)}.sqlite`;
process.env.DB_PATH = DB_FILE;
process.env.JWT_SECRET = "integration-test-secret";
delete process.env.ANTHROPIC_API_KEY; // force the deterministic template path

let app: { request: (input: string, init?: RequestInit) => Promise<Response> };
let token = "";
let oppId = "";
let subId = "";

beforeAll(async () => {
  const mod = await import("../server/index.ts");
  app = mod.app as any;
});

afterAll(() => {
  for (const suffix of ["", "-wal", "-shm"]) {
    try {
      rmSync(DB_FILE + suffix);
    } catch {}
  }
});

function post(path: string, body: unknown, withAuth = false) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (withAuth) headers.Authorization = `Bearer ${token}`;
  return app.request(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}
function authed(path: string, init: RequestInit = {}) {
  return app.request(path, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
}

describe("API integration", () => {
  test("health check responds", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  test("register creates a user and returns a token", async () => {
    const res = await post("/api/auth/register", {
      name: "Grace Hopper",
      email: "grace@example.com",
      password: "compiler123",
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.token).toBeTruthy();
    expect(data.user.email).toBe("grace@example.com");
    token = data.token;
  });

  test("duplicate email is rejected", async () => {
    const res = await post("/api/auth/register", {
      name: "Imposter",
      email: "grace@example.com",
      password: "compiler123",
    });
    expect(res.status).toBe(409);
  });

  test("login works with the right password", async () => {
    const res = await post("/api/auth/login", {
      email: "grace@example.com",
      password: "compiler123",
    });
    expect(res.status).toBe(200);
    expect((await res.json()).token).toBeTruthy();
  });

  test("protected route rejects missing token", async () => {
    const res = await app.request("/api/profile");
    expect(res.status).toBe(401);
  });

  test("profile can be updated and read back", async () => {
    const res = await authed("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headline: "Computing pioneer",
        topics: ["AI", "Computing"],
        speakingHistory: [{ event: "UNIVAC Demo", year: "1952" }],
        feeRange: "$10k",
        location: "Arlington, VA",
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.profile.topics).toEqual(["AI", "Computing"]);
    expect(data.profile.speakingHistory.length).toBe(1);
  });

  test("opportunities are seeded and filterable", async () => {
    const all = await authed("/api/opportunities");
    const allData = await all.json();
    expect(allData.opportunities.length).toBeGreaterThan(5);
    expect(allData.topics.length).toBeGreaterThan(0);
    oppId = allData.opportunities[0].id;

    const filtered = await authed("/api/opportunities?topic=ai");
    const filteredData = await filtered.json();
    expect(filteredData.opportunities.length).toBeGreaterThan(0);
    expect(filteredData.opportunities.length).toBeLessThanOrEqual(
      allData.opportunities.length,
    );
  });

  test("tracking an opportunity creates a submission (idempotent)", async () => {
    const res = await post("/api/submissions", { opportunityId: oppId }, true);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.submission.status).toBe("saved");
    expect(data.submission.opportunity.id).toBe(oppId);
    subId = data.submission.id;

    // Tracking again returns the same submission with 200, not a duplicate.
    const again = await post(
      "/api/submissions",
      { opportunityId: oppId },
      true,
    );
    expect(again.status).toBe(200);
    expect((await again.json()).submission.id).toBe(subId);
  });

  test("generate produces a tailored pitch via template", async () => {
    const res = await post(`/api/submissions/${subId}/generate`, {}, true);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.source).toBe("template");
    expect(data.submission.pitch.length).toBeGreaterThan(50);
    expect(data.submission.status).toBe("drafted");
  });

  test("marking applied stamps appliedAt", async () => {
    const res = await authed(`/api/submissions/${subId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "applied" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.submission.status).toBe("applied");
    expect(data.submission.appliedAt).toBeTruthy();
  });

  test("stats reflect the tracked submission", async () => {
    const res = await authed("/api/submissions/stats");
    const { stats } = await res.json();
    expect(stats.total).toBe(1);
    expect(stats.applied).toBe(1);
    expect(stats.availableOpportunities).toBeGreaterThan(5);
  });

  test("deleting a submission empties the pipeline", async () => {
    const del = await authed(`/api/submissions/${subId}`, { method: "DELETE" });
    expect(del.status).toBe(200);
    const list = await authed("/api/submissions");
    expect((await list.json()).submissions.length).toBe(0);
  });
});
