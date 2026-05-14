// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { cleanLLMOutput } from "../OutputBlockMarkdown";

describe("cleanLLMOutput", () => {
  it("promotes inline keycap-numbered options onto separate rows", () => {
    const input = "Future regret as a feature flag. 1️⃣ Create the flag. 2️⃣ Never read it. 3️⃣ Ship anyway. 4️⃣ Blame QA.";

    expect(cleanLLMOutput(input)).toBe(
      "Future regret as a feature flag.\n\n\u20031️⃣ Create the flag.\n\n\u20032️⃣ Never read it.\n\n\u20033️⃣ Ship anyway.\n\n\u20034️⃣ Blame QA.",
    );
  });
});
