interface SprintProgressBarProps {
  id?: string;
  title?: string;
  sprintProgress?: number;
  sprintGoal?: number;
}

export default function SprintProgressBar({ id, title, sprintProgress, sprintGoal }: SprintProgressBarProps) {
  const hasActiveTicket = Boolean(id && title && sprintProgress !== undefined && sprintGoal !== undefined);
  const totalBlocks = 30;

  if (!hasActiveTicket) {
    return (
      <div className="text-xs font-mono mt-1 pt-1 border-t border-slate-700 sprint-idle-dim" data-testid="sprint-progress-bar">
        <div>
          <span>[SPRINT]</span> IDLE: <span>unclaimed labor capacity</span>
        </div>
        <div className="flex items-center gap-2">
          <span>[{"·".repeat(totalBlocks)}]</span>
          <span>casual chat pays 1x TD</span>
          <span className="sprint-idle-multiplier">10x</span>
        </div>
        <div>
          <span>Claim a formal ticket via </span>
          <span className="text-slate-300">/backlog</span>
          <span> and resume stakeholder-approved suffering.</span>
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
