import { describe, it, expect } from "vitest";
import { extractSender } from "../ticketPrompt";

describe("extractSender", () => {
  it("parses a standard 'Name from Department here, ...' description", () => {
    const result = extractSender(
      "Brenda from Platform Governance here, we need the login flow refactored by EOD.",
    );
    expect(result).toEqual({
      sender: "Brenda (Platform Governance)",
      body: "we need the login flow refactored by EOD.",
    });
  });

  it("parses 'again' variant", () => {
    const result = extractSender(
      "Derek from QA again, the flaky test suite is blocking the release.",
    );
    expect(result).toEqual({
      sender: "Derek (QA)",
      body: "the flaky test suite is blocking the release.",
    });
  });

  it("parses without 'here' or 'again'", () => {
    const result = extractSender(
      "Alex from Engineering, please review the PR.",
    );
    expect(result).toEqual({
      sender: "Alex (Engineering)",
      body: "please review the PR.",
    });
  });

  it("handles hyphenated names", () => {
    const result = extractSender(
      "Jean-Pierre from Engineering here, the build is broken.",
    );
    expect(result).toEqual({
      sender: "Jean-Pierre (Engineering)",
      body: "the build is broken.",
    });
  });

  it("handles multi-word names", () => {
    const result = extractSender(
      "Mary Jane from HR here, onboarding docs need updating.",
    );
    expect(result).toEqual({
      sender: "Mary Jane (HR)",
      body: "onboarding docs need updating.",
    });
  });

  it("handles non-ASCII names", () => {
    const result = extractSender(
      "María from Support here, the ticket queue is overflowing.",
    );
    expect(result).toEqual({
      sender: "María (Support)",
      body: "the ticket queue is overflowing.",
    });
  });

  it("handles period as delimiter", () => {
    const result = extractSender(
      "Sam from DevOps here. The deploy pipeline is stuck.",
    );
    expect(result).toEqual({
      sender: "Sam (DevOps)",
      body: "The deploy pipeline is stuck.",
    });
  });

  it("handles apostrophes in names", () => {
    const result = extractSender(
      "O'Brien from QA here, tests are failing.",
    );
    expect(result).toEqual({
      sender: "O'Brien (QA)",
      body: "tests are failing.",
    });
  });

  it("returns null for non-matching descriptions", () => {
    expect(extractSender("Please fix the login bug.")).toBeNull();
  });

  it("returns null for sentences containing 'from' that are not sender patterns", () => {
    expect(extractSender("Tasks from the backlog, please review.")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractSender("")).toBeNull();
  });

  it("trims trailing whitespace from department", () => {
    const result = extractSender(
      "Tina from Platform  here, check the metrics.",
    );
    expect(result).toEqual({
      sender: "Tina (Platform)",
      body: "check the metrics.",
    });
  });

  it("handles colon as delimiter", () => {
    const result = extractSender(
      "Greg from Infrastructure here: the CDN cache is stale.",
    );
    expect(result).toEqual({
      sender: "Greg (Infrastructure)",
      body: "the CDN cache is stale.",
    });
  });

  it("handles em dash as delimiter", () => {
    const result = extractSender(
      "Lisa from Analytics here — dashboards are down.",
    );
    expect(result).toEqual({
      sender: "Lisa (Analytics)",
      body: "dashboards are down.",
    });
  });

  it("handles lowercase department names", () => {
    const result = extractSender(
      "Kevin from devops here, the pipeline is broken.",
    );
    expect(result).toEqual({
      sender: "Kevin (devops)",
      body: "the pipeline is broken.",
    });
  });

  it("handles department names with ampersand", () => {
    const result = extractSender(
      "Dana from Research & Development here, prototype is ready.",
    );
    expect(result).toEqual({
      sender: "Dana (Research & Development)",
      body: "prototype is ready.",
    });
  });
});
