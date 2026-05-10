import { SLASH_COMMANDS, SLASH_COMMAND_DESCRIPTIONS, SLASH_COMMAND_GROUPS } from "./slashCommands";

type SlashMenuProps = {
  query: string;
  activeIndex: number;
  totalTechnicalDebt: number;
  onSelect: (cmd: string) => void;
};

function SlashMenu({ query, activeIndex, totalTechnicalDebt, onSelect }: SlashMenuProps) {
  const isVisibleCommand = (cmd: string) => {
    if (!SLASH_COMMANDS.includes(cmd)) return false;
    if (cmd === "/store" && totalTechnicalDebt < 1000) return false;
    return cmd.startsWith(query.toLowerCase());
  };

  const filteredGroups = SLASH_COMMAND_GROUPS.map((group) => ({
    ...group,
    commands: group.commands.filter(isVisibleCommand),
  })).filter((group) => group.commands.length > 0);

  const filtered = filteredGroups.flatMap((group) => group.commands);

  if (filtered.length === 0) return null;

  let globalIndex = 0;

  return (
    <ul className="absolute bottom-10 left-0 right-0 sm:right-auto bg-gray-900 rounded border border-gray-700 py-1 z-10 max-h-[calc(100dvh-120px)] overflow-y-auto">
      {filteredGroups.map((group) => (
        <li key={group.title}>
          <div className="px-3 pb-1 pt-2 text-[10px] font-bold tracking-[0.24em] text-cyan-500/80 first:pt-1 select-none">
            {group.title}
          </div>
          <ul>
            {group.commands.map((cmd) => {
              const itemIndex = globalIndex++;

              return (
                <li
                  key={cmd}
                  className={`px-3 py-1 cursor-pointer flex items-center justify-between gap-2 sm:gap-4 ${
                    itemIndex === activeIndex
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
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default SlashMenu;
