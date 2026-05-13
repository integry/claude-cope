// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";

import OutputBlock from "../OutputBlock";
import { buildTicketMessage } from "../ticketPrompt";
import type { Message } from "../../hooks/useGameState";
import type { PlayableBacklogTicket } from "@claude-cope/shared/backlogTickets";

describe("OutputBlock ticket dossier rendering", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  function renderMessage(message: Message, onSlashCommand = vi.fn()) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <OutputBlock
          message={message}
          isNew={false}
          promptString="❯ "
          username="tester"
          onSlashCommand={onSlashCommand}
        />,
      );
    });

    return onSlashCommand;
  }

  function makeTicket(overrides: Partial<PlayableBacklogTicket> = {}): PlayableBacklogTicket {
    return {
      id: "BLAME-421",
      reporter: "Brenda (Platform Governance)",
      reporter_name: "Brenda",
      reporter_title: "Platform Governance",
      reporter_description: "Treats naming as policy and spontaneity as a security flaw.",
      title: "Rewrite the RCA template",
      description: "Brenda from Platform Governance here, we need the login flow refactored by EOD.",
      technical_debt: 144,
      kickoff_prompt: "rewrite the template",
      created_at: "2026-01-01T00:00:00.000Z",
      category_prefix: "BLAME",
      category_label: "Root Cause Theater",
      is_locked: false,
      tier: "free",
      ...overrides,
    };
  }

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    vi.restoreAllMocks();
  });

  it("renders claimed tickets as a corporate dossier with separated metadata and body", () => {
    renderMessage(buildTicketMessage(makeTicket(), "claimed"));

    expect(container.textContent).toContain("[ JIRA PAYLOAD IMPORTED ]");
    expect(container.textContent).toContain("ID:");
    expect(container.textContent).toContain("BLAME-421");
    expect(container.textContent).toContain("TITLE:");
    expect(container.textContent).toContain("Rewrite the RCA template");
    expect(container.textContent).toContain("REPORTER:");
    expect(container.textContent).toContain("Brenda [Platform Governance]");
    expect(container.textContent).toContain("PROFILE:");
    expect(container.textContent).toContain("Treats naming as policy");
    expect(container.textContent).toContain("DESCRIPTION:");
    expect(container.textContent).toContain("we need the login flow refactored by EOD.");
    expect(container.textContent).toContain("REWARD:");
    expect(container.textContent).toContain("1,440 TD");
  });

  it("renders labels dim while title and reporter values carry emphasis", () => {
    renderMessage(buildTicketMessage(makeTicket(), "claimed"));

    const titleValue = Array.from(container.querySelectorAll("div")).find((node) => node.textContent === "Rewrite the RCA template");
    const reporterValue = Array.from(container.querySelectorAll("div")).find((node) => node.textContent === "Brenda [Platform Governance]");
    const reporterLabel = Array.from(container.querySelectorAll("div")).find((node) => node.textContent === "REPORTER:");
    const profileValue = Array.from(container.querySelectorAll("div")).find((node) => node.textContent === "Treats naming as policy and spontaneity as a security flaw.");

    expect(titleValue?.className).toContain("text-white");
    expect(reporterValue?.className).toContain("text-cyan-300");
    expect(reporterLabel?.className).toContain("text-slate-400");
    expect(profileValue?.className).toContain("text-slate-400");
    expect(profileValue?.className).toContain("italic");
  });

  it("keeps slash-link behavior in incoming ticket footers", () => {
    const onSlashCommand = renderMessage(buildTicketMessage(makeTicket(), "offered"));

    const acceptButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "/accept");
    const backlogButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "/backlog");

    expect(acceptButton).toBeTruthy();
    expect(backlogButton).toBeTruthy();

    act(() => {
      acceptButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      backlogButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSlashCommand).toHaveBeenCalledWith("/accept", "execute");
    expect(onSlashCommand).toHaveBeenCalledWith("/backlog", "execute");
  });

  it("falls back to legacy reporter data when split fields are absent", () => {
    const message = buildTicketMessage(makeTicket({
      reporter: null,
      reporter_name: null,
      reporter_title: null,
      reporter_description: null,
      description: "Alex from Engineering, please review the PR.",
    }), "claimed");

    renderMessage(message);

    expect(container.textContent).toContain("REPORTER:");
    expect(container.textContent).toContain("Alex (Engineering)");
    expect(container.textContent).toContain("please review the PR.");
    expect(container.textContent).not.toContain("PROFILE:");
    expect(message.content).toContain("REPORTER: Alex (Engineering)");
  });
});
