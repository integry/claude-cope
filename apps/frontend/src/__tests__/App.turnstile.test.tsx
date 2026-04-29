// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TURNSTILE_REQUIRED_EVENT } from "../turnstileEvents";

type TurnstileWidgetProps = {
  onVerified: () => void;
  onError: (message: string) => void;
  verificationNonce: number;
};

const turnstileWidgetMock = vi.fn<(props: TurnstileWidgetProps) => null>();
const terminalMock = vi.fn(() => createElement("div", { "data-testid": "terminal" }, "terminal"));
const splashMock = vi.fn(({ onComplete }: { onComplete: () => void }) =>
  createElement("button", { type: "button", onClick: onComplete }, "finish splash")
);

vi.mock("../components/TurnstileWidget", () => ({
  default: (props: TurnstileWidgetProps) => {
    turnstileWidgetMock(props);
    return null;
  },
}));

vi.mock("../components/Terminal", () => ({
  default: () => terminalMock(),
}));

vi.mock("../components/SplashScreen", () => ({
  default: (props: { onComplete: () => void }) => splashMock(props),
}));

vi.mock("../components/LegalTermsPage", () => ({
  default: () => createElement("div", null, "terms"),
}));

vi.mock("../components/LegalPrivacyPage", () => ({
  default: () => createElement("div", null, "privacy"),
}));

import App from "../App";

let container: HTMLDivElement;
let root: Root;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function renderApp(pathname = "/") {
  window.history.replaceState({}, "", pathname);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(createElement(App));
  });
}

async function clickSplash() {
  const button = container.querySelector("button");
  expect(button?.textContent).toBe("finish splash");
  await act(async () => {
    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function latestTurnstileProps(): TurnstileWidgetProps {
  const calls = turnstileWidgetMock.mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  return calls[calls.length - 1]?.[0] as TurnstileWidgetProps;
}

afterEach(async () => {
  turnstileWidgetMock.mockClear();
  terminalMock.mockClear();
  splashMock.mockClear();
  if (root) {
    await act(async () => {
      root.unmount();
    });
  }
  if (container?.parentNode) {
    container.parentNode.removeChild(container);
  }
  document.body.innerHTML = "";
  window.history.replaceState({}, "", "/");
});

describe("App turnstile gating", () => {
  it("shows a blocking verification error after a bootstrap verification error", async () => {
    await renderApp("/");
    await clickSplash();

    await act(async () => {
      latestTurnstileProps().onError("Human verification is unavailable because the server is misconfigured.");
    });

    expect(container.textContent).not.toContain("terminal");
    expect(container.textContent).toContain("[HUMAN VERIFICATION FAILED]");
    expect(container.textContent).toContain("server is misconfigured");
  });

  it("keeps public app routes behind turnstile", async () => {
    await renderApp("/help");
    await clickSplash();

    await act(async () => {
      latestTurnstileProps().onError("Human verification failed after multiple attempts.");
    });

    expect(container.textContent).not.toContain("terminal");
    expect(container.textContent).toContain("[HUMAN VERIFICATION FAILED]");
  });

  it("keeps the verification overlay mounted while retrying", async () => {
    await renderApp("/");
    await clickSplash();

    await act(async () => {
      latestTurnstileProps().onError("Human verification failed after multiple attempts.");
    });
    expect(container.textContent).toContain("[HUMAN VERIFICATION FAILED]");

    const retryButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Retry verification",
    );
    expect(retryButton).toBeTruthy();

    await act(async () => {
      retryButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("[RETRYING HUMAN VERIFICATION]");
    expect(container.textContent).toContain("Retrying human verification...");
    expect(container.textContent).not.toContain("finish splash");
  });

  it("re-blocks the terminal when chat requests re-verification", async () => {
    await renderApp("/");

    await act(async () => {
      latestTurnstileProps().onVerified();
    });
    await clickSplash();
    expect(container.textContent).toContain("terminal");

    await act(async () => {
      window.dispatchEvent(new CustomEvent(TURNSTILE_REQUIRED_EVENT));
    });
    expect(container.textContent).not.toContain("terminal");

    await act(async () => {
      latestTurnstileProps().onError("Human verification failed after multiple attempts.");
    });
    expect(container.textContent).toContain("[HUMAN VERIFICATION FAILED]");

    await act(async () => {
      latestTurnstileProps().onVerified();
    });
    expect(container.textContent).toContain("terminal");
  });
});
