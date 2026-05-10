// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import React, { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import SlashMenu from "../SlashMenu";
import { SLASH_COMMAND_GROUPS } from "../slashCommands";

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function renderSlashMenu(props: React.ComponentProps<typeof SlashMenu>) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root!.render(createElement(SlashMenu, props));
  });

  return container;
}

afterEach(() => {
  if (root && container) {
    act(() => {
      root!.unmount();
    });
  }
  if (container) {
    document.body.removeChild(container);
  }
  root = null;
  container = null;
});

describe("SlashMenu", () => {
  it("renders category headers and hides empty groups when filtering", () => {
    const menu = renderSlashMenu({
      query: "/th",
      activeIndex: 0,
      totalTechnicalDebt: 5000,
      onSelect: vi.fn(),
    });

    expect(menu.textContent).toContain("SYSTEM DIRECTIVES");
    expect(menu.textContent).toContain("/theme");
    expect(menu.textContent).not.toContain("COPING MECHANISMS");
    expect(menu.textContent).not.toContain("GUILD HALL");
  });

  it("keeps activeIndex aligned to commands while skipping headers", () => {
    const pingIndex = SLASH_COMMAND_GROUPS.flatMap((group) => group.commands).indexOf("/ping");
    const menu = renderSlashMenu({
      query: "/",
      activeIndex: pingIndex,
      totalTechnicalDebt: 5000,
      onSelect: vi.fn(),
    });

    const selected = Array.from(menu.querySelectorAll("li")).find((item) => item.className.includes("border-cyan-400"));
    expect(selected?.textContent).toContain("/ping");
    expect(selected?.textContent).not.toContain("GUILD HALL/ping");
  });
});
