// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import React, { createElement, createRef } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import CommandLine from "../CommandLine";

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function renderCommandLine(props: Partial<React.ComponentProps<typeof CommandLine>> = {}) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  const inputRef = createRef<HTMLInputElement>();
  const baseProps: React.ComponentProps<typeof CommandLine> = {
    value: "",
    disabled: false,
    onChange: vi.fn(),
    onKeyDown: vi.fn(),
    promptString: "❯ ",
    placeholder: "Try /help",
    assistivePlaceholderHint: "Press Tab to accept suggestion.",
  };

  act(() => {
    root!.render(createElement(CommandLine, { ...baseProps, ...props, ref: inputRef }));
  });

  return {
    container,
    input: container.querySelector("input") as HTMLInputElement | null,
  };
}

afterEach(() => {
  if (root) {
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

describe("CommandLine", () => {
  it("renders the custom placeholder overlay and tab hint when empty", () => {
    const { container } = renderCommandLine();

    expect(container.textContent).toContain("Try /help");
    expect(container.querySelector("[data-testid='command-line-placeholder']")).not.toBeNull();
    expect(container.querySelector("[data-testid='command-line-tab-hint']")?.textContent).toBe("[Tab]");
    expect(container.querySelector("input")?.getAttribute("placeholder")).toBe("Try /help. Press Tab to accept suggestion.");
  });

  it("shows the decorative cursor only while focused and empty", () => {
    const { container, input } = renderCommandLine();
    expect(input).not.toBeNull();

    act(() => {
      input!.focus();
    });

    expect(container.querySelector("[data-testid='command-line-cursor']")).not.toBeNull();

    act(() => {
      input!.blur();
    });

    expect(container.querySelector("[data-testid='command-line-cursor']")).toBeNull();

    act(() => {
      input!.focus();
    });

    expect(container.querySelector("[data-testid='command-line-cursor']")).not.toBeNull();
  });

  it("hides the placeholder overlay when the input has content", () => {
    const { container } = renderCommandLine({ value: "/theme matrix" });

    expect(container.querySelector("[data-testid='command-line-placeholder']")).toBeNull();
    expect(container.textContent).not.toContain("Try /help");
  });

  it("does not show the decorative cursor while disabled", () => {
    const { container } = renderCommandLine({ disabled: true });
    const input = container.querySelector("input");

    expect(container.querySelector("[data-testid='command-line-placeholder']")).not.toBeNull();
    expect(container.querySelector("[data-testid='command-line-cursor']")).toBeNull();
    expect(container.querySelector("[data-testid='command-line-tab-hint']")).toBeNull();
    expect(input?.getAttribute("placeholder")).toBe("Try /help");
  });

  it("does not forward keydown events while IME composition is active", () => {
    const onKeyDown = vi.fn();
    const { input } = renderCommandLine({ onKeyDown });
    expect(input).not.toBeNull();

    act(() => {
      input!.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    });

    act(() => {
      input!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });

    act(() => {
      input!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(onKeyDown).not.toHaveBeenCalled();

    act(() => {
      input!.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    });

    act(() => {
      input!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
