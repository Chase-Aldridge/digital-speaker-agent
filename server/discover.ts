import Anthropic from "@anthropic-ai/sdk";
import type { OppType, PayModel } from "./seed-data.ts";

// The active discovery engine. Given a speaker profile and a refined search, it
// proposes matched speaking and podcast opportunities. With ANTHROPIC_API_KEY it
// uses Claude to research and assemble leads. Without a key it falls back to a
// deterministic generator so the feature still works in a demo.
//
// Discovered items are LEADS to verify, not confirmed bookings. The UI labels
// them as suggestions and the prompt forbids inventing private contact emails.

const MODEL = process.env.AI_MODEL || "claude-sonnet-4-6";

export type DiscoverInput = {
  types: OppType[]; // which kinds of opportunity to find
  topics: string[]; // genres / audiences the speaker wants
  location: string; // base city or a place they will travel to ("" = anywhere / remote)
  openToTravel: boolean;
  payModels: PayModel[]; // desired pay models ([] = any)
  count: number;
  profile: { name: string; headline: string; topics: string[]; location: string };
};

export type DiscoveredOpp = {
  type: OppType;
  title: string;
  organization: string;
  location: string;
  format: string;
  payModel: PayModel;
  topics: string[];
  description: string;
  audienceSize: string;
  feeOffered: string;
  contact: string;
  applicationUrl: string;
  deadline: string | null;
  eventDate: string | null;
  source: string;
};

const PAY_MODELS: PayModel[] = ["paid-opportunity", "free-to-speak", "paid-to-speak", "paid-to-pitch"];

export async function discoverOpportunities(
  input: DiscoverInput,
): Promise<{ opportunities: DiscoveredOpp[]; source: "ai" | "template" }> {
  const count = Math.max(1, Math.min(input.count || 6, 12));
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const opportunities = await discoverWithClaude(key, { ...input, count });
      if (opportunities.length) return { opportunities, source: "ai" };
    } catch (err) {
      console.error("[discover] Claude discovery failed, falling back to template:", err);
    }
  }
  return { opportunities: templateDiscover({ ...input, count }), source: "template" };
}

async function discoverWithClaude(apiKey: string, input: DiscoverInput): Promise<DiscoveredOpp[]> {
  const client = new Anthropic({ apiKey });
  const wantTypes = input.types.length ? input.types : (["event", "podcast"] as OppType[]);
  const where = input.location
    ? `${input.location}${input.openToTravel ? " (and the speaker will travel)" : ""}`
    : "anywhere, including remote and virtual";

  const prompt = `You are a speaking-opportunity researcher for a professional speaker. Propose ${input.count} strong, realistic opportunities the speaker should pursue.

SPEAKER
Name: ${input.profile.name}
Headline: ${input.profile.headline || "n/a"}
Core topics: ${input.profile.topics.join(", ") || "n/a"}
Home base: ${input.profile.location || "n/a"}

SEARCH
Wants these kinds: ${wantTypes.join(", ")}
Topics / audiences: ${input.topics.join(", ") || input.profile.topics.join(", ") || "open"}
Location preference: ${where}
Pay models wanted: ${input.payModels.length ? input.payModels.join(", ") : "any"}

Return ONLY a JSON array (no prose, no markdown fences) of ${input.count} objects with EXACTLY these keys:
- "type": "event" or "podcast"
- "title": the speaking role or episode angle
- "organization": the event or podcast name
- "location": city and region, or "Remote" for podcasts and virtual events
- "format": one of "in-person", "virtual", "hybrid", "remote"
- "payModel": one of "paid-opportunity", "free-to-speak", "paid-to-speak", "paid-to-pitch"
- "topics": array of 2 to 4 topic strings
- "description": 1 to 2 sentences on the fit and the ask
- "audienceSize": a short string like "2,000 attendees" or "15,000 downloads/episode"
- "feeOffered": a short string describing pay or "Unpaid, exposure only"
- "contact": HOW to reach them, for example "Apply via the conference CFP page" or "Pitch through the show's guest form". Do NOT invent a private email address or a person's name.
- "applicationUrl": the most likely real application or guest-pitch URL, or "" if unknown
- "deadline": an ISO date in the next 6 months or null
- "eventDate": an ISO date or null

Rules: match the speaker's topics and location preference. Mix the requested kinds. Prefer real, well-known events and shows where possible, but never fabricate a private contact. These are leads the speaker will verify.`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  const json = extractJsonArray(text);
  const parsed = JSON.parse(json) as any[];
  return parsed.map(normalize).slice(0, input.count);
}

function extractJsonArray(text: string): string {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) throw new Error("no JSON array in model output");
  return text.slice(start, end + 1);
}

function normalize(o: any): DiscoveredOpp {
  const type: OppType = o?.type === "podcast" ? "podcast" : "event";
  const payModel: PayModel = PAY_MODELS.includes(o?.payModel) ? o.payModel : type === "podcast" ? "free-to-speak" : "paid-opportunity";
  const topics = Array.isArray(o?.topics) ? o.topics.map(String).slice(0, 4) : [];
  return {
    type,
    title: String(o?.title || "Speaking opportunity"),
    organization: String(o?.organization || "Unknown organizer"),
    location: String(o?.location || (type === "podcast" ? "Remote" : "")),
    format: ["in-person", "virtual", "hybrid", "remote"].includes(o?.format)
      ? o.format
      : type === "podcast"
        ? "remote"
        : "in-person",
    payModel,
    topics,
    description: String(o?.description || ""),
    audienceSize: String(o?.audienceSize || ""),
    feeOffered: String(o?.feeOffered || ""),
    contact: String(o?.contact || "Check the organizer's site for how to apply"),
    applicationUrl: typeof o?.applicationUrl === "string" ? o.applicationUrl : "",
    deadline: isoOrNull(o?.deadline),
    eventDate: isoOrNull(o?.eventDate),
    source: "AI suggestion",
  };
}

function isoOrNull(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : v;
}

// Deterministic fallback so discovery works with no API key (and in tests).
// Builds plausible leads from the speaker's requested topics and kinds. These
// are clearly labeled as suggestions to verify.
function templateDiscover(input: DiscoverInput): DiscoveredOpp[] {
  const topics = (input.topics.length ? input.topics : input.profile.topics).filter(Boolean);
  const seedTopics = topics.length ? topics : ["Leadership", "AI", "Growth"];
  const wantTypes = input.types.length ? input.types : (["event", "podcast"] as OppType[]);
  const city = input.location || input.profile.location || "Virtual";

  const eventArchetypes = [
    { role: "Breakout speaker", org: (t: string) => `${t} Summit`, fmt: "in-person", pay: "paid-opportunity" as PayModel, fee: "Honorarium plus travel" },
    { role: "Workshop facilitator", org: (t: string) => `${t} Forward`, fmt: "hybrid", pay: "free-to-speak" as PayModel, fee: "Travel covered, no fee" },
    { role: "Virtual keynote", org: (t: string) => `${t} Virtual Summit`, fmt: "virtual", pay: "paid-opportunity" as PayModel, fee: "Honorarium" },
    { role: "Panelist", org: (t: string) => `${t} Leaders Meetup`, fmt: "in-person", pay: "free-to-speak" as PayModel, fee: "Exposure, no fee" },
  ];
  const podcastArchetypes = [
    { role: "Guest expert", org: (t: string) => `The ${t} Show`, pay: "free-to-speak" as PayModel, fee: "Unpaid guest spot" },
    { role: "Featured guest", org: (t: string) => `${t} Founders Podcast`, pay: "paid-to-pitch" as PayModel, fee: "Paid placement" },
    { role: "Interview guest", org: (t: string) => `Inside ${t}`, pay: "free-to-speak" as PayModel, fee: "Unpaid guest spot" },
  ];

  const out: DiscoveredOpp[] = [];
  let i = 0;
  while (out.length < input.count) {
    const topic = seedTopics[i % seedTopics.length];
    const wantEvent = wantTypes.includes("event");
    const wantPodcast = wantTypes.includes("podcast");
    const pickPodcast = wantPodcast && (!wantEvent || i % 2 === 1);

    if (pickPodcast) {
      const a = podcastArchetypes[i % podcastArchetypes.length];
      out.push({
        type: "podcast",
        title: `${a.role} - ${topic} episode`,
        organization: a.org(topic),
        location: "Remote",
        format: "remote",
        payModel: a.pay,
        topics: [topic, ...seedTopics.filter((t) => t !== topic).slice(0, 2)],
        description: `A podcast whose audience cares about ${topic}. Pitch a focused guest segment tied to your work.`,
        audienceSize: "Podcast audience, verify size",
        feeOffered: a.fee,
        contact: "Pitch through the show's guest form, verify before sending",
        applicationUrl: "",
        deadline: null,
        eventDate: null,
        source: "AI suggestion (offline)",
      });
    } else {
      const a = eventArchetypes[i % eventArchetypes.length];
      out.push({
        type: "event",
        title: `${a.role} - ${topic}`,
        organization: a.org(topic),
        location: a.fmt === "virtual" ? "Virtual" : city,
        format: a.fmt,
        payModel: a.pay,
        topics: [topic, ...seedTopics.filter((t) => t !== topic).slice(0, 2)],
        description: `An event focused on ${topic}${city && a.fmt !== "virtual" ? ` near ${city}` : ""}. A strong fit for a tactical, audience-ready session.`,
        audienceSize: "Verify attendee count",
        feeOffered: a.fee,
        contact: "Apply via the event's call-for-speakers page, verify the link",
        applicationUrl: "",
        deadline: null,
        eventDate: null,
        source: "AI suggestion (offline)",
      });
    }
    i++;
  }
  return out.slice(0, input.count);
}
