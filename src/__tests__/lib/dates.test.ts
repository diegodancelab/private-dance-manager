import { describe, it, expect } from "vitest";
import {
  isValidDatetimeLocal,
  isValidDate,
  zurichLocalToUtc,
  utcToZurichDate,
  utcToZurichDatetimeLocal,
} from "@/lib/dates";

// ----------------------------------------------------------------------------
// isValidDatetimeLocal
// ----------------------------------------------------------------------------

describe("isValidDatetimeLocal", () => {
  it("accepts a valid datetime-local string", () => {
    expect(isValidDatetimeLocal("2026-03-15T10:00")).toBe(true);
  });

  it("accepts midnight 00:00", () => {
    expect(isValidDatetimeLocal("2026-03-15T00:00")).toBe(true);
  });

  it("accepts end of day 23:59", () => {
    expect(isValidDatetimeLocal("2026-03-15T23:59")).toBe(true);
  });

  it("rejects a plain date string (no time)", () => {
    expect(isValidDatetimeLocal("2026-03-15")).toBe(false);
  });

  it("rejects invalid month 13", () => {
    expect(isValidDatetimeLocal("2026-13-01T10:00")).toBe(false);
  });

  it("rejects month 0", () => {
    expect(isValidDatetimeLocal("2026-00-01T10:00")).toBe(false);
  });

  it("rejects invalid day 30 in February", () => {
    expect(isValidDatetimeLocal("2026-02-30T10:00")).toBe(false);
  });

  it("rejects hour 24", () => {
    expect(isValidDatetimeLocal("2026-03-15T24:00")).toBe(false);
  });

  it("rejects minute 60", () => {
    expect(isValidDatetimeLocal("2026-03-15T10:60")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidDatetimeLocal("")).toBe(false);
  });

  it("rejects garbage input", () => {
    expect(isValidDatetimeLocal("not-a-date")).toBe(false);
  });
});

// ----------------------------------------------------------------------------
// isValidDate
// ----------------------------------------------------------------------------

describe("isValidDate", () => {
  it("accepts a valid date string", () => {
    expect(isValidDate("2026-03-15")).toBe(true);
  });

  it("accepts Feb 29 in a leap year", () => {
    expect(isValidDate("2024-02-29")).toBe(true);
  });

  it("rejects Feb 29 in a non-leap year", () => {
    expect(isValidDate("2026-02-29")).toBe(false);
  });

  it("rejects invalid day 31 in April", () => {
    expect(isValidDate("2026-04-31")).toBe(false);
  });

  it("rejects month 0", () => {
    expect(isValidDate("2026-00-15")).toBe(false);
  });

  it("rejects month 13", () => {
    expect(isValidDate("2026-13-15")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidDate("")).toBe(false);
  });

  it("rejects a datetime-local string (has time part)", () => {
    expect(isValidDate("2026-03-15T10:00")).toBe(false);
  });
});

// ----------------------------------------------------------------------------
// zurichLocalToUtc — timezone conversion (CET = UTC+1, CEST = UTC+2)
// ----------------------------------------------------------------------------

describe("zurichLocalToUtc", () => {
  it("converts Zurich winter time (CET, UTC+1) correctly", () => {
    const utc = zurichLocalToUtc("2026-01-15T10:00");
    expect(utc.toISOString()).toBe("2026-01-15T09:00:00.000Z");
  });

  it("converts Zurich summer time (CEST, UTC+2) correctly", () => {
    const utc = zurichLocalToUtc("2026-07-15T10:00");
    expect(utc.toISOString()).toBe("2026-07-15T08:00:00.000Z");
  });

  it("handles midnight correctly in winter", () => {
    const utc = zurichLocalToUtc("2026-01-01T00:00");
    expect(utc.toISOString()).toBe("2025-12-31T23:00:00.000Z");
  });

  it("handles midnight correctly in summer", () => {
    const utc = zurichLocalToUtc("2026-07-01T00:00");
    expect(utc.toISOString()).toBe("2026-06-30T22:00:00.000Z");
  });

  it("throws on invalid datetime-local input", () => {
    expect(() => zurichLocalToUtc("not-a-date")).toThrow();
  });

  it("throws on a plain date string", () => {
    expect(() => zurichLocalToUtc("2026-03-15")).toThrow();
  });
});

// ----------------------------------------------------------------------------
// utcToZurichDate — round-trip with zurichLocalToUtc
// ----------------------------------------------------------------------------

describe("utcToZurichDate", () => {
  it("round-trips a winter date", () => {
    const utc = zurichLocalToUtc("2026-01-15T10:00");
    expect(utcToZurichDate(utc)).toBe("2026-01-15");
  });

  it("round-trips a summer date", () => {
    const utc = zurichLocalToUtc("2026-07-15T10:00");
    expect(utcToZurichDate(utc)).toBe("2026-07-15");
  });

  it("shows Zurich date when UTC is still previous day (winter midnight)", () => {
    // 23:30 UTC on Dec 31 = 00:30 on Jan 1 in Zurich
    const utc = new Date("2025-12-31T23:30:00.000Z");
    expect(utcToZurichDate(utc)).toBe("2026-01-01");
  });
});

// ----------------------------------------------------------------------------
// utcToZurichDatetimeLocal — round-trip with zurichLocalToUtc
// ----------------------------------------------------------------------------

describe("utcToZurichDatetimeLocal", () => {
  it("round-trips a winter datetime", () => {
    const utc = zurichLocalToUtc("2026-01-15T10:30");
    expect(utcToZurichDatetimeLocal(utc)).toBe("2026-01-15T10:30");
  });

  it("round-trips a summer datetime", () => {
    const utc = zurichLocalToUtc("2026-07-15T14:45");
    expect(utcToZurichDatetimeLocal(utc)).toBe("2026-07-15T14:45");
  });
});
