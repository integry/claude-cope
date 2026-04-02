const SLASH_COMMANDS = ["/clear", "/support", "/preworkout", "/buddy"];

type SlashMenuProps = {
  query: string;
};

function SlashMenu({ query }: SlashMenuProps) {
  const filtered = SLASH_COMMANDS.filter((cmd) =>
    cmd.startsWith(query.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <ul className="absolute bottom-10 left-0 bg-gray-900 rounded border border-gray-700 py-1 z-10">
      {filtered.map((cmd) => (
        <li
          key={cmd}
          className="px-3 py-1 text-gray-300 hover:bg-gray-800 cursor-default"
        >
          {cmd}
        </li>
      ))}
    </ul>
  );
}

export default SlashMenu;
