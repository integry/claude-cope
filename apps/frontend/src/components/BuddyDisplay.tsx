import { useEffect, useState } from "react";
import { BUDDY_ICONS } from "./buddyConstants";

type BuddyDisplayProps = {
  type: string | null;
  isShiny: boolean;
  className?: string;
};

export function BuddyDisplay({ type, isShiny, className = "" }: BuddyDisplayProps) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;

    const interval = setInterval(() => {
      setBlink(true);
      if (blinkTimeout) {
        clearTimeout(blinkTimeout);
      }
      blinkTimeout = setTimeout(() => {
        setBlink(false);
        blinkTimeout = null;
      }, 200);
    }, 4000);

    return () => {
      clearInterval(interval);
      if (blinkTimeout) {
        clearTimeout(blinkTimeout);
      }
    };
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
      <div className="terminal-buddy-inline">
        <pre className="font-mono whitespace-pre">{art}</pre>
        <div className="terminal-buddy-copy">
          <div className="terminal-buddy-label">[BUDDY]</div>
          <div>{isShiny ? `Shiny ${type} is watching...` : `${type} is watching...`}</div>
        </div>
      </div>
    </div>
  );
}
