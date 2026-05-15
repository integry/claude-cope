import type { Message } from "./gameStateUtils";

export const TIP_PREFIX_PATTERN = /^\s*(?:\/\/\s*)?tip:\s*/i;

export type TipRenderData = {
  isTip: boolean;
  body: string;
};

export function getTipRenderData(message: Pick<Message, "role" | "content" | "displayType">): TipRenderData {
  if (message.role !== "system" || message.displayType !== "tip") {
    return { isTip: false, body: "" };
  }

  const match = TIP_PREFIX_PATTERN.exec(message.content);
  return {
    isTip: true,
    body: match ? message.content.slice(match[0].length) : message.content,
  };
}
