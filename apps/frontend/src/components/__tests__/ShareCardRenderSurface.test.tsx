/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ShareCardRenderSurface from "../ShareCardRenderSurface";

describe("ShareCardRenderSurface", () => {
  it("uses a narrower fixed width and content-driven height", () => {
    const { container } = render(
      <ShareCardRenderSurface
        prompt={"what's the least legal risk?"}
        response={"The least legal risk is the one with less whitespace in the share image."}
        username="zookeeper"
      />
    );

    const root = container.querySelector("#share-card-root");
    expect(root?.className).toContain("w-[760px]");
    expect(root?.className).not.toContain("h-[630px]");

    const prompt = screen.getByText("what's the least legal risk?");
    expect(prompt.closest("div")?.className).toContain("break-words");
  });
});
