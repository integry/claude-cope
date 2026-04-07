interface SprintProgressBarProps {
  id: string;
  title: string;
  sprintProgress: number;
  sprintGoal: number;
}

export default function SprintProgressBar({ id, title, sprintProgress, sprintGoal }: SprintProgressBarProps) {
  const sprintPercent = Math.min(100, Math.round((sprintProgress / sprintGoal) * 100));
  const totalBlocks = 30;
  const filledBlocks = Math.round((sprintPercent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return (
    <div className="text-xs font-mono text-cyan-400 mt-1 pt-1">
      <span className="text-cyan-600">[SPRINT]</span> {id}: <span className="text-cyan-300 truncate">{title}</span>
      <div className="flex items-center gap-2">
        <span className="text-cyan-500">[{"█".repeat(filledBlocks)}{"░".repeat(emptyBlocks)}]</span>
        <span className="text-cyan-300">{sprintProgress}/{sprintGoal} TD</span>
        <span className="text-cyan-600">{sprintPercent}%</span>
      </div>
    </div>
  );
}
