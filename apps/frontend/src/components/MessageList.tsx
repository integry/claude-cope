import { memo } from "react";
import OutputBlock from "./OutputBlock";
import type { Message } from "../hooks/useGameState";
import type { SlashCommandAction } from "./slashCommandDetect";

/** Memoized message list — only re-renders when history/keys/props actually change */
const MessageList = memo(function MessageList({ history, messageKeys, initialHistoryLen, promptString, activeTicketId, username, isFreeTier, onSlashCommand }: {
  history: Message[];
  messageKeys: number[];
  initialHistoryLen: number;
  promptString: string;
  activeTicketId?: string | null;
  username: string;
  isFreeTier: boolean;
  onSlashCommand?: (command: string, action: SlashCommandAction) => void;
}) {
  return (
    <>
      {history.map((message, index) => (
        <OutputBlock key={messageKeys[index]} message={message} previousMessage={history[index - 1]} nextMessage={history[index + 1]} isNew={index >= initialHistoryLen} promptString={promptString} activeTicketId={activeTicketId} username={username} isFreeTier={isFreeTier} onSlashCommand={onSlashCommand} />
      ))}
    </>
  );
});

export default MessageList;
