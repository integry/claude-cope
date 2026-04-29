import type { Dispatch, SetStateAction } from "react";

export function TerminalFooter({ closeAllOverlays, setShowTerms, setShowPrivacy, setShowAbout, setShowHelp, setShowContact }: {
  closeAllOverlays: () => void;
  setShowTerms: Dispatch<SetStateAction<boolean>>;
  setShowPrivacy: Dispatch<SetStateAction<boolean>>;
  setShowAbout: Dispatch<SetStateAction<boolean>>;
  setShowHelp: Dispatch<SetStateAction<boolean>>;
  setShowContact: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      <footer className="shrink-0 w-full text-xs text-gray-500 pt-2 pb-1 backdrop-blur-sm font-mono hidden sm:flex sm:flex-col gap-1" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 80%, transparent)' }}>
        <div><span className="text-gray-400">[LEGAL]</span> This is a parody project and is not affiliated with Anthropic.</div>
        <div className="flex items-center justify-between">
          <span><span className="text-gray-400">[BLAME]</span> {"© 2026 Unchained Development OÜ && git blame --author=\"Rinalds Uzkalns\""}</span>
          <span>{"made with "}<a href="https://propr.dev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">propr.dev</a></span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex gap-4 items-center"><span className="text-gray-400">[LINKS]</span>{([["terms", setShowTerms], ["privacy", setShowPrivacy], ["about", setShowAbout], ["help", setShowHelp], ["contact", setShowContact]] as [string, Dispatch<SetStateAction<boolean>>][]).map(([key, setter]: [string, Dispatch<SetStateAction<boolean>>]) => (<button key={key} onClick={() => { closeAllOverlays(); setter(true); if (key !== "about" && key !== "help") window.history.pushState(null, "", `/${key}`); }} className="text-gray-400 hover:text-white">/{key}</button>))}</span>
          <span className="flex gap-4">{[["https://github.com/integry/claude-cope", "/github"], ["https://reddit.com/r/claudecope", "/reddit"], ["https://discord.gg/claudecope", "/discord"], ["https://x.com/claudecope", "/x"]].map(([href, label]) => (<a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">{label}</a>))}</span>
        </div>
      </footer>
      <footer className="shrink-0 w-full text-xs text-gray-500 pt-2 pb-2 backdrop-blur-sm font-mono sm:hidden text-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 80%, transparent)' }}><span className="leading-tight">Parody project, no Anthropic affiliation.</span></footer>
    </>
  );
}
