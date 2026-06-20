import Anthropic from "@anthropic-ai/sdk";

export type SpeakerProfileInput = {
  name: string;
  headline: string;
  bio: string;
  topics: string[];
  speakingHistory: { event: string; year?: string; role?: string }[];
  feeRange: string;
  location: string;
};

export type OpportunityInput = {
  title: string;
  organization: string;
  description: string;
  topics: string[];
  format: string;
  audienceSize: string;
};

const MODEL = process.env.AI_MODEL || "claude-sonnet-4-6";

// Generates a tailored speaking application. Uses Claude when ANTHROPIC_API_KEY
// is configured; otherwise falls back to a deterministic template so the feature
// always works in a demo.
export async function generatePitch(
  profile: SpeakerProfileInput,
  opp: OpportunityInput,
): Promise<{ pitch: string; source: "ai" | "template" }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const pitch = await generateWithClaude(key, profile, opp);
      return { pitch, source: "ai" };
    } catch (err) {
      console.error("[ai] Claude generation failed, falling back to template:", err);
    }
  }
  return { pitch: templatePitch(profile, opp), source: "template" };
}

async function generateWithClaude(
  apiKey: string,
  profile: SpeakerProfileInput,
  opp: OpportunityInput,
): Promise<string> {
  const client = new Anthropic({ apiKey });
  const history = profile.speakingHistory
    .map((h) => `- ${h.event}${h.role ? ` (${h.role})` : ""}${h.year ? `, ${h.year}` : ""}`)
    .join("\n");

  const prompt = `You are helping a professional speaker apply to a speaking opportunity. Write a concise, compelling application in the speaker's first-person voice.

SPEAKER
Name: ${profile.name}
Headline: ${profile.headline}
Location: ${profile.location}
Topics: ${profile.topics.join(", ") || "n/a"}
Speaking fee: ${profile.feeRange || "flexible"}
Bio: ${profile.bio || "n/a"}
Speaking history:
${history || "n/a"}

OPPORTUNITY
Event: ${opp.title} by ${opp.organization}
Format: ${opp.format}
Expected audience: ${opp.audienceSize}
Topics wanted: ${opp.topics.join(", ") || "n/a"}
Description: ${opp.description}

Write the application with three short labeled parts:
1. A 2-3 sentence pitch on why this speaker is a strong fit for THIS event.
2. A proposed session title and a 3-4 sentence abstract tailored to the event's audience.
3. One sentence on the value the audience walks away with.

Rules: warm and confident, never generic. No em dashes. Plain language. Do not invent facts about the speaker beyond what is given. Output only the application text.`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 900,
    messages: [{ role: "user", content: prompt }],
  });

  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

function templatePitch(profile: SpeakerProfileInput, opp: OpportunityInput): string {
  const overlap = profile.topics.filter((t) =>
    opp.topics.map((x) => x.toLowerCase()).includes(t.toLowerCase()),
  );
  const focus = overlap[0] || opp.topics[0] || profile.topics[0] || "this topic";
  const headline = profile.headline || "a speaker focused on real, practical takeaways";
  const recent = profile.speakingHistory[0]?.event;

  return `WHY I'M A FIT
I'm ${profile.name}, ${headline}. ${opp.organization}'s focus on ${opp.topics.join(", ") || focus} lines up directly with what I speak on every week${
    recent ? `, most recently at ${recent}` : ""
  }. I tailor every session to the room, and a ${opp.format} audience of ${opp.audienceSize || "this size"} is exactly where my material lands.

PROPOSED SESSION
Title: "${sessionTitle(focus)}"
This session gives the ${opp.organization} audience a clear, no-fluff path through ${focus}. I open with the one mistake most people make, walk through a simple framework they can use the next day, and close with a short live example. Every point is built around what your attendees can act on, not theory.

THE TAKEAWAY
Attendees leave with a repeatable approach to ${focus} they can put to work immediately.`;
}

function sessionTitle(focus: string): string {
  return `${capitalize(focus)} Without the Guesswork`;
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
