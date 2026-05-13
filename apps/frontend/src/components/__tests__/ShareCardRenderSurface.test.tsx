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

    expect(markup).toContain('id="share-card-root"');
    expect(markup).toContain('class="w-[760px] overflow-hidden bg-[#0d1117] text-[15px] text-white"');
    expect(markup).not.toContain("h-[630px]");
    expect(markup).toContain("inline-block max-w-full break-words");
    expect(markup).toContain("what&#x27;s the least legal risk?");
  });
});
