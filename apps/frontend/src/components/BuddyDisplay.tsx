import { BUDDY_ICONS } from "./buddyConstants";

export function BuddyDisplay({ type, isShiny }: { type: string | null; isShiny: boolean }) {
  if (!type) return null;
  return (
    <div className={`text-xs mb-1 ${isShiny ? "text-amber-300" : "text-yellow-400"}`}>
      <pre className="font-mono whitespace-pre inline-block">{BUDDY_ICONS[type] ?? "🐾"}</pre>
      <div>{isShiny ? `✨ Shiny ${type} ✨` : type} is watching...</div>
    </div>
  );
}
