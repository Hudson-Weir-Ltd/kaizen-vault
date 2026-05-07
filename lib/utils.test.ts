import { describe, it, expect } from "vitest";
import {
  cn,
  formatDateGB,
  formatNumber,
  getMaturityColor,
  getMaturityLevel,
  getStatusColor,
  parseProgress,
} from "./utils";

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("getStatusColor", () => {
  it("returns expected tokens", () => {
    expect(getStatusColor("healthy")).toBe("var(--green)");
    expect(getStatusColor("at-risk")).toBe("var(--amber)");
    expect(getStatusColor("critical")).toBe("var(--red)");
  });
});

describe("getMaturityLevel", () => {
  it.each([
    [0, "Foundational"],
    [19, "Foundational"],
    [20, "Developing"],
    [40, "Established"],
    [60, "Advanced"],
    [80, "Optimized"],
    [100, "Optimized"],
  ] as const)("score %i -> %s", (pct, expected) => {
    expect(getMaturityLevel(pct)).toBe(expected);
  });
});

describe("getMaturityColor", () => {
  it("maps every level", () => {
    expect(getMaturityColor("Foundational")).toBe("var(--red)");
    expect(getMaturityColor("Optimized")).toBe("var(--green)");
  });
});

describe("formatNumber", () => {
  it("abbreviates thousands", () => {
    expect(formatNumber(950)).toBe("950");
    expect(formatNumber(1500)).toBe("1.5k");
    expect(formatNumber(12_847)).toBe("12.8k");
  });
});

describe("parseProgress", () => {
  it("higher_is_better: at target -> 100", () => {
    expect(parseProgress("75%", "75%", "higher_is_better")).toBe(100);
  });

  it("higher_is_better: above target -> capped at 120", () => {
    expect(parseProgress("90%", "75%", "higher_is_better")).toBe(120);
  });

  it("higher_is_better: below target -> partial", () => {
    expect(parseProgress("60%", "80%", "higher_is_better")).toBe(75);
  });

  it("lower_is_better: at target -> 100", () => {
    expect(parseProgress("$12.00", "$12.00", "lower_is_better")).toBe(100);
  });

  it("lower_is_better: above target (worse) -> below 100", () => {
    // $14.20 vs $12.00 target => 12/14.20 ≈ 84.5%
    const result = parseProgress("$14.20", "$12.00", "lower_is_better");
    expect(result).not.toBeNull();
    expect(result!).toBeLessThan(100);
    expect(result!).toBeGreaterThan(80);
  });

  it("lower_is_better: below target (better) -> capped at 120", () => {
    expect(parseProgress("$8.00", "$12.00", "lower_is_better")).toBe(120);
  });

  it("strips currency, percent, and thousands separators", () => {
    expect(parseProgress("12,847", "11,000", "higher_is_better")).toBeCloseTo(116.79, 1);
  });

  it("returns null when inputs are not parseable", () => {
    expect(parseProgress("abc", "def", "higher_is_better")).toBeNull();
  });

  it("defaults to higher_is_better when direction omitted", () => {
    expect(parseProgress("75%", "75%")).toBe(100);
  });
});

describe("formatDateGB", () => {
  it("uses en-GB long format", () => {
    const out = formatDateGB(new Date("2026-03-31"));
    // en-GB: "Tuesday, 31 March 2026"
    expect(out).toMatch(/Tuesday/);
    expect(out).toMatch(/31 March 2026/);
  });
});
