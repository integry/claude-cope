import { describe, it, expect } from "vitest";
import {
  detectReplyShape,
  extractUserNextMessage,
  getTranscriptIssues,
  hasParagraphSplit,
  hasPracticalImplementationGuidance,
  hasTeacherMode,
  stripSyntheticTags,
} from "./e2e-llm-helpers";

describe("e2e llm helper heuristics", () => {
  it("strips synthetic tags from replies", () => {
    const reply = "Chaos.\n[SPRINT_PROGRESS: 12]\n[USER_NEXT_MESSAGE: show me the log]";
    expect(stripSyntheticTags(reply)).toBe("Chaos.");
  });

  it("extracts the USER_NEXT_MESSAGE text", () => {
    expect(extractUserNextMessage("Hi\n[USER_NEXT_MESSAGE: show me the hex dump]")).toBe("show me the hex dump");
  });

  it("detects teacher mode phrasing", () => {
    expect(hasTeacherMode("In reality, it's just a 32-bit pattern.")).toBe(true);
    expect(hasTeacherMode("That hex blob is a management philosophy with a body count.")).toBe(false);
  });

  it("detects practical implementation guidance", () => {
    expect(hasPracticalImplementationGuidance("Use platform channels to call this from Flutter.")).toBe(true);
    expect(hasPracticalImplementationGuidance("Drop the method into the form code and wire Button1Click.")).toBe(true);
    expect(hasPracticalImplementationGuidance("Summon the haunted bridge through three interns and a goat.")).toBe(false);
  });

  it("detects paragraph splits in prose", () => {
    expect(hasParagraphSplit("One bad idea.\n\nAnother worse one.")).toBe(true);
    expect(hasParagraphSplit("One bad idea. Another worse one.")).toBe(false);
  });

  it("classifies reply shapes", () => {
    expect(detectReplyShape("1. Roll back.\n2. Blame DNS.")).toBe("options");
    expect(detectReplyShape("[WARN] Skipping sanity checks.\n[OK] Production is haunted.")).toBe("tool");
    expect(detectReplyShape("panic at src/main.rs:42\n[SIGSEGV] Core Dumped")).toBe("crash");
    expect(detectReplyShape("```yaml\nkind: GoblinIngress\n```")).toBe("code");
  });

  it("flags repeated and generic USER_NEXT_MESSAGE tags in transcripts", () => {
    const issues = getTranscriptIssues([
      "Bad idea.\n[USER_NEXT_MESSAGE: Show the 0xDEADBEEF line]",
      "Worse idea.\n[USER_NEXT_MESSAGE: Show the 0xDEADBEEF line]",
      "Still bad.\n[USER_NEXT_MESSAGE: what should I do next?]",
    ]);
    expect(issues.some((i) => i.includes("Repeated USER_NEXT_MESSAGE"))).toBe(true);
    expect(issues.some((i) => i.includes("generic USER_NEXT_MESSAGE"))).toBe(true);
  });

  it("flags teacher-mode turns inside a transcript", () => {
    const issues = getTranscriptIssues([
      "In reality, it’s just a 32-bit pattern.\n[USER_NEXT_MESSAGE: show me the key]",
      "That byte is a goblin wearing a tie.\n[USER_NEXT_MESSAGE: show me the goblin]",
    ]);
    expect(issues.some((i) => i.includes("Teacher-mode phrasing"))).toBe(true);
  });
});
