import { SLASH_COMMANDS } from "./slashCommands";

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
    <ul className="absolute bottom-10 left-0 bg-gray-900 rounded border border-gray-700 py-1 z-10">
      {filtered.map((cmd, i) => (
        <li
          key={cmd}
          className={`px-3 py-1 cursor-pointer ${
            i === activeIndex
              ? "bg-gray-700 text-white"
              : "text-gray-300 hover:bg-gray-800"
          }`}
          onClick={() => onSelect(cmd)}
        >
          {cmd}
        </li>
      ))}
    </ul>
  );
}

export default SlashMenu;
