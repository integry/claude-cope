// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import React, { createElement, createRef } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import CommandLine from "../CommandLine";

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let mobileViewport = false;

function installMatchMediaMock() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(max-width: 767px)" ? mobileViewport : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

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
    onSubmit: vi.fn(),
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
  mobileViewport = false;
  vi.restoreAllMocks();
  installMatchMediaMock();
});

installMatchMediaMock();

describe("CommandLine", () => {
  it("does not autofocus the input on render", () => {
    const { input } = renderCommandLine();

    expect(input).not.toBeNull();
    expect(document.activeElement).not.toBe(input);
  });

  it("renders the custom placeholder overlay and tab hint when empty", () => {
    const { container } = renderCommandLine();
    const placeholder = container.querySelector("[data-testid='command-line-placeholder']");
    const suggestedReply = container.querySelector("[data-testid='command-line-suggested-reply']");
    const leadingChar = container.querySelector("[data-testid='command-line-suggested-reply-leading-char']");

    expect(container.textContent).toContain("Try /help");
    expect(placeholder).not.toBeNull();
    expect(suggestedReply?.textContent).toBe("Try /help");
    expect(leadingChar?.textContent).toBe("T");
    expect(container.querySelector("[data-testid='command-line-tab-hint']")?.textContent).toBe("[Tab]");
    expect(container.querySelector("input")?.getAttribute("placeholder")).toBe("Try /help. Press Tab to accept suggestion.");
  });

  it("switches the hint to tap on mobile and requests submit when tapped", () => {
    mobileViewport = true;
    const onPlaceholderAccept = vi.fn();
    const { container, input } = renderCommandLine({ onPlaceholderAccept });
    const hint = container.querySelector("[data-testid='command-line-tab-hint']") as HTMLButtonElement | null;

    expect(hint?.textContent).toBe("[Tap]");
    expect(container.querySelector("input")?.getAttribute("placeholder")).toBe("Try /help. Press Tap to accept suggestion.");

    act(() => {
      input?.focus();
      hint?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      hint?.click();
    });

    expect(onPlaceholderAccept).toHaveBeenCalledTimes(1);
    expect(onPlaceholderAccept).toHaveBeenCalledWith({ submit: true });
    expect(document.activeElement).toBe(input);
  });

  it("shows the decorative cursor over the first suggested character only while focused and empty", () => {
    const { container, input } = renderCommandLine();
    expect(input).not.toBeNull();

    act(() => {
      input!.focus();
    });

    const cursor = container.querySelector("[data-testid='command-line-cursor']");
    const leadingChar = container.querySelector("[data-testid='command-line-suggested-reply-leading-char']");

    expect(cursor).not.toBeNull();
    expect(leadingChar?.contains(cursor)).toBe(true);

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
    expect(container.querySelector("[data-testid='command-line-tab-hint']")).toBeNull();
    expect(container.textContent).not.toContain("Try /help");
  });

  it("shows a mobile send button while typing and submits through it", () => {
    mobileViewport = true;
    const onSubmit = vi.fn();
    const { container, input } = renderCommandLine({ value: "/help", onSubmit });
    const sendButton = container.querySelector("[data-testid='command-line-send-button']") as HTMLButtonElement | null;

    expect(sendButton?.textContent).toBe("[ ↵ ]");
    expect(container.querySelector("[data-testid='command-line-placeholder']")).toBeNull();

    act(() => {
      input?.focus();
      sendButton?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      sendButton?.click();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(input);
  });

  it("does not show the send button on desktop", () => {
    const { container } = renderCommandLine({ value: "/help" });

    expect(container.querySelector("[data-testid='command-line-send-button']")).toBeNull();
  });

  it("does not show the decorative cursor while disabled", () => {
    const { container } = renderCommandLine({ disabled: true });
    const input = container.querySelector("input");
    const leadingChar = container.querySelector("[data-testid='command-line-suggested-reply-leading-char']");

    expect(container.querySelector("[data-testid='command-line-placeholder']")).not.toBeNull();
    expect(container.querySelector("[data-testid='command-line-cursor']")).toBeNull();
    expect(leadingChar?.textContent).toBe("T");
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
