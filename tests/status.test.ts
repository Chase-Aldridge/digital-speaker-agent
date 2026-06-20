import { test, expect, describe } from "bun:test";
import { formatDate, daysUntil, STATUS_ORDER, STATUS_META } from "../src/lib/status.ts";

describe("formatDate", () => {
  test("formats an ISO date", () => {
    expect(formatDate("2026-08-01")).toContain("2026");
  });
  test("returns dash for null/invalid", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("daysUntil", () => {
  test("future date is positive", () => {
    const future = new Date(Date.now() + 5 * 86400000).toISOString();
    const d = daysUntil(future);
    expect(d).not.toBeNull();
    expect(d!).toBeGreaterThan(0);
  });
  test("null input returns null", () => {
    expect(daysUntil(null)).toBe(null);
  });
});

describe("status metadata", () => {
  test("every status in the order has metadata", () => {
    for (const s of STATUS_ORDER) {
      expect(STATUS_META[s]).toBeDefined();
      expect(STATUS_META[s].label.length).toBeGreaterThan(0);
    }
  });
});
