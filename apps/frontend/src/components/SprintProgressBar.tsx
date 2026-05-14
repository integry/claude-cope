import { renderWithSlashLinks } from "./slashCommandLinks";
import type { SlashCommandAction } from "./slashCommandDetect";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";

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
  const safeProgress = sprintProgress ?? 0;
  const safeGoal = sprintGoal ?? 0;
  const animatedProgress = useAnimatedCounter(safeProgress, {
    duration: 2200,
    animateDecreases: false,
    resetKey: hasActiveTicket ? `${id}:${safeGoal}` : "idle",
  });

  if (!hasActiveTicket) {
    return (
      <div className="text-xs font-mono mt-3 pt-1.5 pb-1.5 border-t border-slate-700 sprint-idle-dim" data-testid="sprint-progress-bar">
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

  const displayProgress = Math.floor(animatedProgress);
  const sprintPercent = safeGoal > 0 ? Math.min(100, Math.round((animatedProgress / safeGoal) * 100)) : 0;
  const filledBlocks = Math.round((sprintPercent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;

  return (
    <div className="text-xs font-mono text-cyan-400 mt-3 pt-1.5 pb-1.5 border-t border-cyan-800" data-testid="sprint-progress-bar">
      <div className="flex min-w-0 items-baseline gap-1">
        <span className="shrink-0 text-cyan-600">[SPRINT]</span>
        <span className="shrink-0">{id}:</span>
        <span className="sprint-title min-w-0 flex-1 text-cyan-300">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-cyan-500">[{"█".repeat(filledBlocks)}{"░".repeat(emptyBlocks)}]</span>
        <span className="text-cyan-300">{displayProgress}/{safeGoal} TD</span>
        <span className="text-cyan-600">{sprintPercent}%</span>
      </div>
    </div>
  );
}
