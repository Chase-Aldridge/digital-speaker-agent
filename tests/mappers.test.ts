import { test, expect, describe } from "bun:test";
import { mapOpportunity, mapProfile, mapSubmission } from "../server/types.ts";

describe("mapOpportunity", () => {
  test("parses topics JSON and maps snake_case to camelCase", () => {
    const o = mapOpportunity({
      id: "o1",
      title: "Talk",
      organization: "Org",
      location: "Denver",
      format: "virtual",
      topics: '["AI","SaaS"]',
      description: "desc",
      audience_size: "100",
      fee_offered: "$1k",
      application_url: "https://x",
      deadline: "2026-07-01",
      event_date: "2026-08-01",
      source: "CFP",
      created_at: "2026-06-01",
    });
    expect(o.topics).toEqual(["AI", "SaaS"]);
    expect(o.audienceSize).toBe("100");
    expect(o.applicationUrl).toBe("https://x");
  });

  test("falls back to empty array on bad topics JSON", () => {
    const o = mapOpportunity({ topics: "not-json" });
    expect(o.topics).toEqual([]);
  });
});

describe("mapProfile", () => {
  test("parses JSON columns with safe fallbacks", () => {
    const p = mapProfile({
      headline: "h",
      topics: '["AI"]',
      speaking_history: '[{"event":"X"}]',
      social: "{bad json",
      testimonials: "[]",
      fee_range: "$5k",
    });
    expect(p.topics).toEqual(["AI"]);
    expect(p.speakingHistory).toEqual([{ event: "X" }]);
    expect(p.social).toEqual({}); // bad JSON -> fallback
    expect(p.feeRange).toBe("$5k");
  });
});

describe("mapSubmission", () => {
  test("embeds the joined opportunity when present", () => {
    const s = mapSubmission({
      id: "s1",
      opportunity_id: "o1",
      status: "applied",
      pitch: "p",
      notes: "n",
      applied_at: "2026-06-10",
      created_at: "2026-06-01",
      updated_at: "2026-06-02",
      opp_id: "o1",
      opp_title: "Talk",
      opp_organization: "Org",
      opp_topics: '["AI"]',
      opp_format: "virtual",
      opp_audience_size: "100",
      opp_fee_offered: "$1k",
      opp_application_url: "https://x",
      opp_location: "Denver",
      opp_description: "d",
      opp_deadline: "2026-07-01",
      opp_event_date: "2026-08-01",
      opp_source: "CFP",
      opp_created_at: "2026-06-01",
    });
    expect(s.status).toBe("applied");
    expect(s.opportunity?.title).toBe("Talk");
    expect(s.opportunity?.topics).toEqual(["AI"]);
  });

  test("opportunity is null when not joined", () => {
    const s = mapSubmission({ id: "s2", status: "saved", opp_id: null });
    expect(s.opportunity).toBe(null);
  });
});
