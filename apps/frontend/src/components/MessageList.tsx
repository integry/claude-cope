import { memo } from "react";
import OutputBlock from "./OutputBlock";
import type { Message } from "../hooks/useGameState";
import type { SlashCommandAction } from "./slashCommandDetect";

/** Memoized message list — only re-renders when history/keys/props actually change */
const MessageList = memo(function MessageList({ history, messageKeys, initialHistoryLen, promptString, activeTicketId, username, onSlashCommand }: {
  history: Message[];
  messageKeys: number[];
  initialHistoryLen: number;
  promptString: string;
  activeTicketId?: string | null;
  username: string;
  onSlashCommand?: (command: string, action: SlashCommandAction) => void;
}) {
  let nearestUserMessage: Message | undefined;

  return (
    <>
      {history.map((message, index) => {
        const shareUserMessage = nearestUserMessage;
        if (message.role === "user") {
          nearestUserMessage = message;
        }

        return (
          <OutputBlock
            key={messageKeys[index]}
            message={message}
            previousMessage={history[index - 1]}
            nextMessage={history[index + 1]}
            shareUserMessage={shareUserMessage}
            isNew={index >= initialHistoryLen}
            promptString={promptString}
            activeTicketId={activeTicketId}
            username={username}
            onSlashCommand={onSlashCommand}
          />
        );
      })}
    </>
  );
});

export default MessageList;
