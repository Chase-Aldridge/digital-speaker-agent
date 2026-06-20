import type { SubmissionStatus } from "./types";

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
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
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
