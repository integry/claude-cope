import { useEffect, useState } from "react";
import { BUDDY_ICONS } from "./buddyConstants";

export function BuddyDisplay({ type, isShiny }: { type: string | null; isShiny: boolean }) {
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
    <div className={`text-xs mt-2 mb-4 text-center ${isShiny ? "text-amber-300" : "text-orange-400"}`}>
      <pre className="font-mono whitespace-pre inline-block">{art}</pre>
      <div>{isShiny ? `✨ Shiny ${type} ✨` : type} is watching...</div>
    </div>
  );
}
