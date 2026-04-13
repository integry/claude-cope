import { SLASH_COMMANDS, SLASH_COMMAND_DESCRIPTIONS } from "./slashCommands";

type SlashMenuProps = {
  query: string;
  activeIndex: number;
  totalTechnicalDebt: number;
  onSelect: (cmd: string) => void;
};

function SlashMenu({ query, activeIndex, totalTechnicalDebt, onSelect }: SlashMenuProps) {
  const filtered = SLASH_COMMANDS.filter((cmd) => {
    if (cmd === "/store" && totalTechnicalDebt < 1000) return false;
    return cmd.startsWith(query.toLowerCase());
  });

  if (filtered.length === 0) return null;

  return (
    <ul className="absolute bottom-10 left-0 right-0 sm:right-auto bg-gray-900 rounded border border-gray-700 py-1 z-10 max-h-[70vh] overflow-y-auto">
      {filtered.map((cmd, i) => (
        <li
          key={cmd}
          className={`px-3 py-1 cursor-pointer flex items-center justify-between gap-2 sm:gap-4 ${
            i === activeIndex
              ? "bg-gray-700 text-white border-l-2 border-cyan-400"
              : "text-gray-300 hover:bg-gray-800 border-l-2 border-transparent"
          }`}
          onClick={() => onSelect(cmd)}
        >
          <span className={`whitespace-nowrap ${cmd === "/backlog" ? "font-bold text-yellow-400" : ""}`}>{cmd}</span>
          {SLASH_COMMAND_DESCRIPTIONS[cmd] && (
            <span className="text-gray-500 text-xs truncate min-w-0">{SLASH_COMMAND_DESCRIPTIONS[cmd]}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default SlashMenu;
