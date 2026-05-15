// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import OutputBlock from "../OutputBlock";
import { buildMarkdownComponents } from "../OutputBlockMarkdown";

describe("OutputBlock markdown links", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("opens external markdown links in a new tab with safe rel attributes", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <OutputBlock
          message={{ role: "system", content: "[ GITHUB ISSUES ](https://github.com/integry/claude-cope/issues)" }}
          promptString=">"
          username=""
        />,
      );
    });

    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("https://github.com/integry/claude-cope/issues");
    expect(anchor?.getAttribute("target")).toBe("_blank");
    expect(anchor?.getAttribute("rel")).toBe("noreferrer noopener");
  });

  it("preserves the share-link sentinel renderer path", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const components = buildMarkdownComponents(undefined, <button type="button">share</button>);

    act(() => {
      root.render(<>{components.a({ href: "https://__share__", children: "share" })}</>);
    });

    expect(container.querySelector("button")?.textContent).toBe("share");
    expect(container.querySelector("a")).toBeNull();
  });
});
