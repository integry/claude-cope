type AboutOverlayProps = {
  onClose: () => void;
};

const sections: { title: string; content: string; link?: string }[] = [
  {
    title: "WHAT IS THIS?",
    content:
      "Claude Cope is a parody idle/clicker game disguised as a developer terminal. It satirizes the modern software engineering experience — from mandatory synergy meetings to infinite technical debt. No real code is harmed in the process (probably).",
  },
  {
    title: "ORIGINS",
    content:
      "Born from the collective trauma of developers everywhere, Claude Cope started as a joke about AI-assisted coding tools and spiraled into a full-blown interactive experience. Think of it as group therapy, but with more JSON and fewer breakthroughs.",
  },
  {
    title: "THE PARODY",
    content:
      "This project lovingly parodies AI coding assistants, corporate software culture, and the developer experience. Every slash command, achievement, and sarcastic response is a tribute to the absurdity of shipping code in the modern era.",
  },
  {
    title: "DISCLAIMER",
    content:
      "This is a parody project and is NOT affiliated with or endorsed by Anthropic, OpenAI, or any other AI company. Any resemblance to real products is purely satirical. No LLMs were emotionally harmed during development (we asked, they said they're fine).",
  },
  {
    title: "TECH STACK",
    content:
      "Built with React, TypeScript, TailwindCSS, and an unhealthy amount of setTimeout calls. Powered by vibes, caffeine, and mass amounts of technical debt — the very thing it parodies.",
  },
  {
    title: "CREDITS",
    content:
      "Made by developers, for developers, during hours that should have been spent on actual sprint tickets. If your standup asks what you did yesterday, do not mention this project.",
  },
  {
    title: "AUTHOR",
    content: "Rinalds Uzkalns",
    link: "https://www.linkedin.com/in/rinaldsuzkalns/",
  },
];

function AboutOverlay({ onClose }: AboutOverlayProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-700 flex flex-col z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-green-400 font-bold text-sm">
          &gt; cat ABOUT.md
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-sm"
        >
          [x]
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-700 text-green-400 text-xs font-bold">
        <pre>{`
 ╔══════════════════════════════╗
 ║     ABOUT CLAUDE COPE       ║
 ║   A PARODY FOR THE DAMNED   ║
 ╚══════════════════════════════╝`}</pre>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="border border-gray-700 rounded px-3 py-2 text-xs"
          >
            <div className="font-bold text-yellow-300 mb-1">
              [{section.title}]
            </div>
            <div className="text-gray-400 whitespace-pre-line">
              {section.link ? (
                <a href={section.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">{section.content}</a>
              ) : (
                section.content
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-gray-700 text-gray-600 text-xs">
        [version: 1.0.0-cope | license: WTFPL | bugs: yes]
      </div>
    </div>
  );
}

export default AboutOverlay;
