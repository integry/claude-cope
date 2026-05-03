// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";

const adminFetchMock = vi.fn();
const mutateMock = vi.fn();
const useAdminApiMock = vi.fn();

vi.mock("../hooks/useAdminApi", () => ({
  useAdminFetch: () => adminFetchMock,
  useAdminApi: (...args: unknown[]) => useAdminApiMock(...args),
}));

import Configuration from "./Configuration";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function setNativeValue(element: HTMLInputElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(element) as HTMLInputElement | HTMLSelectElement;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(element, value);
}

function renderComponent() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(createElement(Configuration));
  });
}

async function clickButton(label: string) {
  const button = Array.from(container.querySelectorAll("button")).find((element) => element.textContent?.trim() === label);
  if (!button) throw new Error(`Button not found: ${label}`);
  await act(async () => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

async function changeInput(input: HTMLInputElement, value: string) {
  await act(async () => {
    setNativeValue(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function changeSelect(select: HTMLSelectElement, value: string) {
  await act(async () => {
    setNativeValue(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function getFormPanel() {
  const heading = Array.from(container.querySelectorAll("h2")).find((element) =>
    element.textContent === "Add Setting" || element.textContent === "Edit Setting");
  if (!heading?.parentElement) throw new Error("Configuration form panel not found");
  return heading.parentElement;
}

function cleanup() {
  adminFetchMock.mockReset();
  mutateMock.mockReset();
  useAdminApiMock.mockReset();
  if (root) {
    act(() => root.unmount());
  }
  if (container?.parentNode) {
    container.parentNode.removeChild(container);
  }
}

describe("Configuration save flow", () => {
  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    adminFetchMock.mockResolvedValue({});
    mutateMock.mockResolvedValue(undefined);
  });

  afterEach(cleanup);

  it("submits the actual sensitive value when editing a trusted admin setting", async () => {
    useAdminApiMock.mockReturnValue({
      data: [
        {
          key: "openrouter_api_key",
          tier: "*",
          value: "sk-or-v1-real-secret",
          description: "Old description",
          updated_at: "2026-05-03T00:00:00.000Z",
        },
      ],
      isLoading: false,
      isError: null,
      mutate: mutateMock,
    });

    renderComponent();
    await clickButton("Edit");

    const panel = getFormPanel();
    const editableInputs = Array.from(panel.querySelectorAll('input[type="text"]')).filter(
      (input): input is HTMLInputElement => input instanceof HTMLInputElement && !input.disabled,
    );
    const valueInput = editableInputs.find((input) => input.value === "sk-or-v1-real-secret");
    if (!valueInput) throw new Error("Value input not found");
    const descriptionInput = editableInputs.find((input) => input.value === "Old description");
    if (!descriptionInput) throw new Error("Description input not found");

    await changeInput(descriptionInput, "Updated description");
    await clickButton("Save");

    expect(adminFetchMock).toHaveBeenCalledTimes(1);
    const [, init] = adminFetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({
      value: "sk-or-v1-real-secret",
      description: "Updated description",
    });
  });

  it("allows clearing an existing description from the edit form", async () => {
    useAdminApiMock.mockReturnValue({
      data: [
        {
          key: "openrouter_api_key",
          tier: "*",
          value: "sk-or-v1-real-secret",
          description: "Old description",
          updated_at: "2026-05-03T00:00:00.000Z",
        },
      ],
      isLoading: false,
      isError: null,
      mutate: mutateMock,
    });

    renderComponent();
    await clickButton("Edit");

    const panel = getFormPanel();
    const editableInputs = Array.from(panel.querySelectorAll('input[type="text"]')).filter(
      (input): input is HTMLInputElement => input instanceof HTMLInputElement && !input.disabled,
    );
    const descriptionInput = editableInputs.find((input) => input.value === "Old description");
    if (!descriptionInput) throw new Error("Description input not found");

    await changeInput(descriptionInput, "");
    await clickButton("Save");

    expect(adminFetchMock).toHaveBeenCalledTimes(1);
    const [, init] = adminFetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      value: "sk-or-v1-real-secret",
      description: "",
    });
  });

  it("allows creating a global sensitive setting with an empty value", async () => {
    useAdminApiMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: null,
      mutate: mutateMock,
    });

    renderComponent();
    await clickButton("Add Setting");

    const panel = getFormPanel();
    const keySelect = panel.querySelector("select");
    if (!(keySelect instanceof HTMLSelectElement)) throw new Error("Key select not found");

    await changeSelect(keySelect, "openrouter_api_key");
    await clickButton("Save");

    expect(adminFetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = adminFetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/config/openrouter_api_key/*");
    expect(JSON.parse(String(init.body))).toMatchObject({
      value: "",
    });
  });

  it("normalizes documented boolean aliases before client-side validation and submission", async () => {
    useAdminApiMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: null,
      mutate: mutateMock,
    });

    renderComponent();
    await clickButton("Add Setting");

    const panel = getFormPanel();
    const keySelect = panel.querySelector("select");
    if (!(keySelect instanceof HTMLSelectElement)) throw new Error("Key select not found");

    await changeSelect(keySelect, "openrouter_providers_free_only");

    const editableInputs = Array.from(panel.querySelectorAll('input[type="text"]')).filter(
      (input): input is HTMLInputElement => input instanceof HTMLInputElement && !input.disabled,
    );
    const valueInput = editableInputs[0];
    if (!valueInput) throw new Error("Value input not found");

    await changeInput(valueInput, "YES");
    await clickButton("Save");

    expect(adminFetchMock).toHaveBeenCalledTimes(1);
    const [, init] = adminFetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      value: "true",
    });
  });
});
