import { useEffect, useState } from "react";
import { BUDDY_ICONS } from "./buddyConstants";

export function BuddyDisplay({ type, isShiny, className = "" }: { type: string | null; isShiny: boolean; className?: string }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!type) return null;

  let art = BUDDY_ICONS[type] ?? "🐾";
  if (blink) {
    if (type === "Agile Snail") {
      art = art.replace("@..@", "@--@");
    } else {
      art = art.replace(/O/g, "-").replace(/o\.o/g, "-.-").replace(/o/g, "-");
    }
  }

  return (
    <div className={`text-xs ${isShiny ? "text-amber-300" : "text-orange-400"} ${className}`.trim()}>
      <pre className="font-mono whitespace-pre">{art}</pre>
      <div>{isShiny ? `✨ Shiny ${type} ✨` : type} is watching...</div>
    </div>
  );
}
