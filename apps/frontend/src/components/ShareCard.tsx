import OutputBlock from "./OutputBlock";
import type { Message } from "./Terminal";

export type ShareCardProps = {
  prompt: string;
  response: string;
  username: string;
  theme?: string | null;
  rootId?: string;
  className?: string;
};

const cardStyle = {
  width: "1200px",
  height: "630px",
  background:
    "radial-gradient(circle at top left, rgba(86, 182, 194, 0.18), transparent 32%), linear-gradient(180deg, #0d1117 0%, #111827 100%)",
} as const;

export function ShareCard({
  prompt,
  response,
  username,
  theme,
  rootId = "share-card-root",
  className = "",
}: ShareCardProps) {
  const userMessage: Message = { role: "user", content: prompt };
  const systemMessage: Message = { role: "system", content: response };

  return (
    <div
      id={rootId}
      className={`relative overflow-hidden border border-cyan-400/20 text-[18px] text-gray-100 shadow-[0_28px_80px_rgba(0,0,0,0.45)] ${className}`.trim()}
      style={cardStyle}
    >
      <div className="flex h-full flex-col p-10">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-cyan-400/15 pb-4 font-mono text-sm uppercase tracking-[0.22em]">
          <div className="min-w-0 truncate text-cyan-200/85">{`shared by @${username}`}</div>
          <div className="truncate text-yellow-300/90">{(theme ?? "default").toUpperCase()}</div>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] gap-6">
          <div className="min-h-0 overflow-hidden rounded-2xl border border-white/8 bg-black/20 p-6">
            <OutputBlock message={userMessage} promptString="❯ " enableShare={false} />
          </div>
          <div className="min-h-0 overflow-hidden rounded-2xl border border-white/8 bg-black/30 p-6">
            <OutputBlock message={systemMessage} previousMessage={userMessage} username={username} enableShare={false} />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.2em] text-gray-500">
          <div>cope.bot</div>
          <div className="text-cyan-300/70">immutable share snapshot</div>
        </div>
      </div>
    </div>
  );
}

export default ShareCard;
