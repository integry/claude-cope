import type { BacklogDisplayData } from "../hooks/gameStateUtils";
import { renderWithSlashLinks } from "./slashCommandLinks";
import type { SlashCommandAction } from "./slashCommandDetect";

function renderLine(
  line: string,
  onSlashCommand?: (command: string, action: SlashCommandAction) => void,
): React.ReactNode {
  if (!line) return <div className="h-3" aria-hidden="true" />;
  return onSlashCommand ? renderWithSlashLinks(line, onSlashCommand) : line;
}

export function BacklogMessage({
  backlog,
  onSlashCommand,
}: {
  backlog: BacklogDisplayData;
  onSlashCommand?: (command: string, action: SlashCommandAction) => void;
}) {
  return (
    <div className="max-w-full font-mono text-[13px] leading-relaxed text-cyan-100">
      <div className="border-y border-dashed border-cyan-400/60 py-2">
        <div className="text-cyan-200">{backlog.title}</div>
        {backlog.filterHeader && <div className="mt-1 text-cyan-300/85">{backlog.filterHeader}</div>}
        {backlog.infoLine && <div className="mt-1 text-slate-400">{renderLine(backlog.infoLine, onSlashCommand)}</div>}
      </div>

      <div className="hidden border-b border-dashed border-cyan-400/40 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-400 md:grid md:grid-cols-[3rem_7.5rem_minmax(0,1fr)_5rem_6rem] md:gap-4">
        <div>#</div>
        <div>ID</div>
        <div>Title</div>
        <div>Status</div>
        <div className="text-right">Reward</div>
      </div>

      <div>
        {backlog.tickets.map((ticket) => (
          <div
            key={`${ticket.row}-${ticket.fullId}`}
            className="border-b border-dashed border-cyan-400/40 py-2 last:border-b-0 md:grid md:grid-cols-[3rem_7.5rem_minmax(0,1fr)_5rem_6rem] md:items-start md:gap-4"
          >
            <div className="hidden text-slate-300 md:block">[{ticket.row}]</div>
            <div className="hidden text-cyan-200 md:block">{ticket.shortId}</div>
            <div className={`hidden min-w-0 break-words text-cyan-100 [overflow-wrap:anywhere] md:block ${ticket.isLocked ? "text-amber-200" : ""}`}>
              {ticket.title}
            </div>
            <div className={`hidden md:block ${ticket.isLocked ? "text-amber-300" : "text-slate-300"}`}>
              {ticket.status}
            </div>
            <div className={`hidden text-right md:block ${ticket.isLocked ? "text-amber-300" : "text-cyan-200"}`}>
              {ticket.reward}
            </div>

            <div className="flex flex-col gap-1 md:hidden">
              <div className="flex items-center justify-between gap-3 text-[12px] text-slate-400">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-slate-200">[{ticket.row}]</span>
                  <span className="truncate text-cyan-200">{ticket.shortId}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={ticket.isLocked ? "text-amber-300" : "text-slate-300"}>{ticket.status}</span>
                  <span className={ticket.isLocked ? "text-amber-300" : "text-cyan-200"}>{ticket.reward}</span>
                </div>
              </div>
              <div className={`min-w-0 break-words text-cyan-100 [overflow-wrap:anywhere] ${ticket.isLocked ? "text-amber-200" : ""}`}>
                {ticket.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-cyan-400/60 pt-3 text-slate-300">
        {backlog.footer.map((line, index) => (
          <div key={`${index}-${line}`} className={line ? "mt-1" : ""}>
            {renderLine(line, onSlashCommand)}
          </div>
        ))}
      </div>
    </div>
  );
}
