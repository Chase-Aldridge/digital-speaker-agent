import type { SubmissionStatus, PayModel } from "./types";

type Tone = "neutral" | "ink" | "red" | "amber" | "blue" | "green";

export const PAY_MODEL_META: Record<
  PayModel,
  { label: string; tone: Tone; short: string }
> = {
  "paid-opportunity": { label: "Gets you paid", tone: "green", short: "Paid" },
  "free-to-speak": { label: "Free to speak", tone: "blue", short: "Free" },
  "paid-to-speak": {
    label: "Pay to speak",
    tone: "amber",
    short: "Pay to play",
  },
  "paid-to-pitch": {
    label: "Paid placement",
    tone: "amber",
    short: "Paid placement",
  },
};

export function payModelMeta(
  pm: string,
): { label: string; tone: Tone; short: string } | null {
  return (
    (
      PAY_MODEL_META as Record<
        string,
        { label: string; tone: Tone; short: string }
      >
    )[pm] || null
  );
}

export function typeLabel(type: string): string {
  return type === "podcast" ? "Podcast" : "Event";
}

export const STATUS_ORDER: SubmissionStatus[] = [
  "saved",
  "drafted",
  "applied",
  "in_review",
  "accepted",
  "rejected",
];

export const STATUS_META: Record<
  SubmissionStatus,
  {
    label: string;
    tone: "neutral" | "ink" | "red" | "amber" | "blue" | "green";
  }
> = {
  saved: { label: "Queued", tone: "neutral" },
  drafted: { label: "Draft ready", tone: "blue" },
  applied: { label: "On air", tone: "amber" },
  in_review: { label: "In review", tone: "ink" },
  accepted: { label: "Booked", tone: "green" },
  rejected: { label: "Passed", tone: "red" },
};

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "TBD";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "TBD";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const ms = d.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
