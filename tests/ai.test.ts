import { test, expect, describe, beforeAll } from "bun:test";
import { generatePitch, type SpeakerProfileInput, type OpportunityInput } from "../server/ai.ts";

const profile: SpeakerProfileInput = {
  name: "Ada Lovelace",
  headline: "keynote speaker on computing",
  bio: "Pioneer of programming.",
  topics: ["AI", "Computing"],
  speakingHistory: [{ event: "Analytical Engine Expo", year: "1843", role: "Keynote" }],
  feeRange: "$5k",
  location: "London",
};

const opp: OpportunityInput = {
  title: "The Future of Computing",
  organization: "DevWorld",
  description: "A developer-focused session.",
  topics: ["AI", "DevTools"],
  format: "in-person",
  audienceSize: "8,000",
};

describe("generatePitch (template fallback)", () => {
  beforeAll(() => {
    // Force the deterministic template path regardless of local env.
    delete process.env.ANTHROPIC_API_KEY;
  });

  test("returns the template source when no API key is set", async () => {
    const { pitch, source } = await generatePitch(profile, opp);
    expect(source).toBe("template");
    expect(pitch.length).toBeGreaterThan(50);
  });

  test("pitch references the speaker and the event", async () => {
    const { pitch } = await generatePitch(profile, opp);
    expect(pitch).toContain("Ada Lovelace");
    expect(pitch).toContain("DevWorld");
  });

  test("pitch contains the three labeled sections", async () => {
    const { pitch } = await generatePitch(profile, opp);
    expect(pitch).toContain("WHY I'M A FIT");
    expect(pitch).toContain("PROPOSED SESSION");
    expect(pitch).toContain("THE TAKEAWAY");
  });
});
