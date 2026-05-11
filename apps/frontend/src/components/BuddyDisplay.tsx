import { useEffect, useState } from "react";
import { BUDDY_ICONS } from "./buddyConstants";

type BuddyDisplayProps = {
  type: string | null;
  isShiny: boolean;
  className?: string;
};

type BuddyWatcherStatusProps = {
  type: string | null;
  isShiny: boolean;
  className?: string;
};

function getBuddyArt(type: string, blink: boolean) {
  let art = BUDDY_ICONS[type] ?? "🐾";
  if (!blink) {
    return art;
  }

  if (type === "Agile Snail") {
    return art.replace("@..@", "@--@");
  }

  return art.replace(/O/g, "-").replace(/o\.o/g, "-.-").replace(/o/g, "-");
}

function getBuddyWatcherCopy(type: string, isShiny: boolean) {
  return isShiny ? `Shiny ${type} is watching...` : `${type} is watching...`;
}

export function BuddyWatcherStatus({
  type,
  isShiny,
  className = "",
}: BuddyWatcherStatusProps) {
  if (!type) return null;

  return (
    <div
      className={
        `terminal-buddy-status ${isShiny ? "text-amber-300" : "text-orange-400"} ${className}`.trim()
      }
    >
      <span className="terminal-buddy-status-label">[BUDDY]</span>
      <span>{getBuddyWatcherCopy(type, isShiny)}</span>
    </div>
  );
}

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

  const art = getBuddyArt(type, blink);

  return (
    <div className={`text-xs ${isShiny ? "text-amber-300" : "text-orange-400"} ${className}`.trim()}>
      <pre className="font-mono whitespace-pre">{art}</pre>
    </div>
  );
}
