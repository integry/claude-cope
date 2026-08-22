import type { TicketDisplayData } from "../hooks/gameStateUtils";
import { renderWithSlashLinks } from "./slashCommandLinks";
import type { SlashCommandAction } from "./slashCommandDetect";

function renderLine(
  line: string,
  onSlashCommand?: (command: string, action: SlashCommandAction) => void,
): React.ReactNode {
  if (!line) return <div className="h-3" aria-hidden="true" />;
  return onSlashCommand ? renderWithSlashLinks(line, onSlashCommand) : line;
}

function DossierField({
  label,
  value,
  valueClassName,
  stackOnMobile = false,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  stackOnMobile?: boolean;
}) {
  const rowClassName = stackOnMobile
    ? "flex flex-col gap-1 md:grid md:grid-cols-[5.5rem_minmax(0,1fr)] md:gap-3"
    : "grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3";

  return (
    <div className={rowClassName}>
      <div className="text-slate-400">{label}</div>
      <div className={valueClassName}>{value}</div>
    </div>
  );
}

export function TicketMessage({
  ticket,
  onSlashCommand,
}: {
  ticket: TicketDisplayData;
  onSlashCommand?: (command: string, action: SlashCommandAction) => void;
}) {
  return (
    <div className="max-w-full font-mono text-[13px] leading-relaxed text-cyan-100 md:pr-3">
      <div className="border-y border-dashed border-cyan-400/60 py-2">
        <div className="text-cyan-200">{ticket.heading}</div>
      </div>

      <div className="space-y-2 border-b border-dashed border-cyan-400/40 py-3">
        <DossierField label="ID:" value={ticket.ticketId} valueClassName="text-cyan-200" />
        <DossierField label="TITLE:" value={ticket.title} valueClassName="text-white" stackOnMobile />
        <DossierField label="REPORTER:" value={ticket.reporter} valueClassName="text-cyan-300" stackOnMobile />
        {ticket.profile && (
          <DossierField label="PROFILE:" value={ticket.profile} valueClassName="text-slate-400 italic" stackOnMobile />
        )}
      </div>

      <div className="border-b border-dashed border-cyan-400/40 py-3">
        <DossierField
          label="DESCRIPTION:"
          value={<div className="whitespace-pre-wrap break-words text-cyan-100 [overflow-wrap:anywhere] md:max-w-[72ch]">{ticket.body}</div>}
          stackOnMobile
        />
      </div>

      <div className="border-b border-dashed border-cyan-400/40 py-3">
        <DossierField label="REWARD:" value={ticket.reward} valueClassName="text-cyan-200" />
      </div>

      <div className="pt-3 text-slate-300">
        {ticket.footer.map((line, index) => (
          <div key={`${line || "blank"}-${index}`} className={line ? "mt-1" : ""}>
            {renderLine(line, onSlashCommand)}
          </div>
        ))}
      </div>
    </div>
  );
}
