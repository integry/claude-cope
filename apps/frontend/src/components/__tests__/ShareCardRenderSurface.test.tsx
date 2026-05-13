import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ShareCardRenderSurface from "../ShareCardRenderSurface";

describe("ShareCardRenderSurface", () => {
  it("uses a narrower fixed width and content-driven height", () => {
    const markup = renderToStaticMarkup(
      <ShareCardRenderSurface
        prompt={"what's the least legal risk?"}
        response={"The least legal risk is the one with less whitespace in the share image."}
        username="zookeeper"
      />
    );
    const document = new JSDOM(markup).window.document;

    const root = document.querySelector("#share-card-root");
    expect(root?.className).toContain("w-[760px]");
    expect(root?.className).not.toContain("h-[630px]");

    const prompt = Array.from(document.querySelectorAll("div, span")).find(
      (element) => element.textContent === "what's the least legal risk?"
    );
    expect(prompt?.closest("div")?.className).toContain("break-words");
  });
});
