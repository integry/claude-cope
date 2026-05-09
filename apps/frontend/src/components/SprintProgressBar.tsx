import { renderWithSlashLinks } from "./slashCommandLinks";
import type { SlashCommandAction } from "./slashCommandDetect";

interface SprintProgressBarProps {
  id?: string;
  title?: string;
  sprintProgress?: number;
  sprintGoal?: number;
  onSlashCommand?: (command: string, action: SlashCommandAction) => void;
}

export default function SprintProgressBar({ id, title, sprintProgress, sprintGoal, onSlashCommand }: SprintProgressBarProps) {
  const hasActiveTicket = Boolean(id && title && sprintProgress !== undefined && sprintGoal !== undefined);
  const totalBlocks = 30;
  const idleBarBlocks = 17;

  if (!hasActiveTicket) {
    return (
      <div className="text-xs font-mono mt-1 pt-1 border-t border-slate-700 sprint-idle-dim" data-testid="sprint-progress-bar">
        <div>
          <span>[SPRINT]</span> WAITING FOR DESTRUCTION <span>(Current Earning Rate: 1x)</span>
        </div>
        <div>
          <span>[{"-".repeat(idleBarBlocks)}]</span>
          <span> </span>
          {onSlashCommand ? (
            <>
              {renderWithSlashLinks("Open the /backlog. Official tasks inflict ", onSlashCommand)}
              <span className="sprint-idle-multiplier">10x</span>
              <span> more Technical Debt.</span>
            </>
          ) : (
            <>
              <span>Open the /backlog. Official tasks inflict </span>
              <span className="sprint-idle-multiplier">10x</span>
              <span> more Technical Debt.</span>
            </>
          )}
        </div>
      </div>
    );
  }

  const safeProgress = sprintProgress!;
  const safeGoal = sprintGoal!;
  const sprintPercent = Math.min(100, Math.round((safeProgress / safeGoal) * 100));
  const filledBlocks = Math.round((sprintPercent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;

  return (
    <div className="text-xs font-mono text-cyan-400 mt-1 pt-1 border-t border-cyan-800" data-testid="sprint-progress-bar">
      <span className="text-cyan-600">[SPRINT]</span> {id}: <span className="text-cyan-300 truncate">{title}</span>
      <div className="flex items-center gap-2">
        <span className="text-cyan-500">[{"█".repeat(filledBlocks)}{"░".repeat(emptyBlocks)}]</span>
        <span className="text-cyan-300">{safeProgress}/{safeGoal} TD</span>
        <span className="text-cyan-600">{sprintPercent}%</span>
      </div>
    </div>
  );
}
