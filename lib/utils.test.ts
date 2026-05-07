import { describe, it, expect } from "vitest";
import {
  cn,
  getStatusColor,
  getMaturityLevel,
  getMaturityColor,
  formatNumber,
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
