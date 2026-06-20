import { test, expect, describe, beforeAll } from "bun:test";
import { discoverOpportunities, type DiscoverInput } from "../server/discover.ts";

const base: DiscoverInput = {
  types: ["event", "podcast"],
  topics: ["AI", "Leadership"],
  location: "Denver, CO",
  openToTravel: true,
  payModels: [],
  count: 6,
  profile: { name: "Ada Lovelace", headline: "AI keynote speaker", topics: ["AI"], location: "Denver, CO" },
};

describe("discoverOpportunities (template fallback)", () => {
  beforeAll(() => {
    delete process.env.ANTHROPIC_API_KEY; // force the deterministic path
  });

  test("returns the requested count from the template engine", async () => {
    const { opportunities, source } = await discoverOpportunities(base);
    expect(source).toBe("template");
    expect(opportunities.length).toBe(6);
  });

  test("caps the count at 12", async () => {
    const { opportunities } = await discoverOpportunities({ ...base, count: 50 });
    expect(opportunities.length).toBe(12);
  });

  test("podcast-only search returns only podcasts", async () => {
    const { opportunities } = await discoverOpportunities({ ...base, types: ["podcast"], count: 5 });
    expect(opportunities.length).toBe(5);
    expect(opportunities.every((o) => o.type === "podcast")).toBe(true);
  });

  test("every lead carries a valid pay model and a contact", async () => {
    const valid = ["paid-opportunity", "free-to-speak", "paid-to-speak", "paid-to-pitch"];
    const { opportunities } = await discoverOpportunities(base);
    for (const o of opportunities) {
      expect(valid).toContain(o.payModel);
      expect(o.contact.length).toBeGreaterThan(0);
    }
  });
});
