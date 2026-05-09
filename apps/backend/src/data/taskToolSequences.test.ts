import { describe, expect, it } from "vitest";
import {
  FALLBACK_SEQUENCES,
  getSequencesForTask,
  hasSpecificTaskSequence,
  resolveTaskSequenceKey,
} from "./taskToolSequences";

describe("taskToolSequences legacy aliasing", () => {
  it("resolves themed project ids to legacy COPE sequence keys by numeric suffix", () => {
    expect(resolveTaskSequenceKey("YELL-001")).toBe("COPE-001");
    expect(resolveTaskSequenceKey("MELT-102")).toBe("COPE-102");
    expect(resolveTaskSequenceKey("BLORT-160")).toBe("COPE-160");
  });

  it("reports task-specific sequences for themed ids that map to legacy entries", () => {
    expect(hasSpecificTaskSequence("RIFT-127")).toBe(true);
    expect(hasSpecificTaskSequence("SCAM-149")).toBe(true);
  });

  it("falls back for ids with no direct or aliased sequence entry", () => {
    expect(resolveTaskSequenceKey("PANIC-240")).toBeNull();
    expect(hasSpecificTaskSequence("PANIC-240")).toBe(false);
    expect(getSequencesForTask("PANIC-240")).toBe(FALLBACK_SEQUENCES);
  });

  it("returns the aliased task-specific sequences for themed ids", () => {
    expect(getSequencesForTask("YELL-001")).toEqual(getSequencesForTask("COPE-001"));
    expect(getSequencesForTask("MELT-144")).toEqual(getSequencesForTask("COPE-144"));
  });
});
