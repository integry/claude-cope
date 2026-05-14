import type { Message } from "./gameStateUtils";

export const TIP_PREFIX_PATTERN = /^\s*(?:\/\/\s*)?tip:\s*/i;

export type TipRenderData = {
  isTip: boolean;
  body: string;
};

export function getTipRenderData(message: Pick<Message, "role" | "content" | "displayType">): TipRenderData {
  if (message.role !== "system") {
    return { isTip: false, body: "" };
  }

  const match = TIP_PREFIX_PATTERN.exec(message.content);
  const isTaggedTip = message.displayType === "tip";
  if (!isTaggedTip && !match) {
    return { isTip: false, body: "" };
  }

  return {
    isTip: true,
    body: match ? message.content.slice(match[0].length) : message.content,
  };
}
