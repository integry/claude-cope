import { getSlashMenuItems } from "./slashCommands";

type SlashMenuProps = {
  query: string;
  activeIndex: number;
  totalTechnicalDebt: number;
  paidUser: boolean;
  isExecutiveSupporter?: boolean;
  onSelect: (cmd: string) => void;
};

function SlashMenu({ query, activeIndex, totalTechnicalDebt, paidUser, isExecutiveSupporter = false, onSelect }: SlashMenuProps) {
  const items = getSlashMenuItems(query, totalTechnicalDebt, paidUser, isExecutiveSupporter);
  if (items.length === 0) return null;

  const isBacklogMode = items[0]?.type === "backlog-category";
  const isModelMode = items[0]?.type === "model-choice";
  const isPromoteMode = items[0]?.type === "promote-choice";
  const maxHeightClassName = isBacklogMode
    ? "max-h-[calc(100dvh-14rem)] sm:max-h-[calc(100dvh-220px)]"
    : "max-h-[calc(100dvh-120px)]";

  return (
    <ul className={`absolute bottom-10 left-0 right-0 sm:right-auto bg-gray-900 rounded border border-gray-700 py-1 z-10 overflow-y-auto ${maxHeightClassName}`}>
      {isBacklogMode ? (
        <li>
          <div className="px-3 pb-1 pt-2 text-[10px] font-bold tracking-[0.24em] text-cyan-500/80 first:pt-1 select-none">
            BACKLOG CATEGORIES
          </div>
          <ul>
            {items.map((item, index) => {
              if (item.type !== "backlog-category") return null;

              return (
                <li
                  key={item.value}
                  className={`px-3 py-2 cursor-pointer flex items-start justify-between gap-3 ${
                    index === activeIndex
                      ? "bg-gray-700 text-white border-l-2 border-cyan-400"
                      : "text-gray-300 hover:bg-gray-800 border-l-2 border-transparent"
                  }`}
                  onClick={() => onSelect(item.value)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`whitespace-nowrap font-bold ${item.prefix === "ALL" ? "text-yellow-400" : "text-cyan-300"}`}>{item.prefix}</span>
                      <span className="truncate text-sm">{item.label}</span>
                      {item.locked && <span className="shrink-0 text-[10px] font-bold tracking-[0.2em] text-amber-400">LOCKED</span>}
                    </div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </li>
      ) : isModelMode ? (
        <li>
          <div className="px-3 pb-1 pt-2 text-[10px] font-bold tracking-[0.24em] text-cyan-500/80 first:pt-1 select-none">
            MODEL CHOICES
          </div>
          <ul>
            {items.map((item, index) => {
              if (item.type !== "model-choice") return null;

              return (
                <li
                  key={item.value}
                  className={`px-3 py-2 cursor-pointer flex items-start justify-between gap-3 ${
                    index === activeIndex
                      ? "bg-gray-700 text-white border-l-2 border-cyan-400"
                      : "text-gray-300 hover:bg-gray-800 border-l-2 border-transparent"
                  }`}
                  onClick={() => onSelect(item.value)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap font-bold text-cyan-300">{item.modelId}</span>
                      <span className="truncate text-sm">{item.label}</span>
                      {item.locked && <span className="shrink-0 text-[10px] font-bold tracking-[0.2em] text-amber-400">LOCKED</span>}
                    </div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </li>
      ) : isPromoteMode ? (
        <li>
          <div className="px-3 pb-1 pt-2 text-[10px] font-bold tracking-[0.24em] text-cyan-500/80 first:pt-1 select-none">
            VANITY TITLES
          </div>
          <ul>
            {items.map((item, index) => {
              if (item.type !== "promote-choice") return null;

              return (
                <li
                  key={item.value}
                  className={`px-3 py-2 cursor-pointer flex items-start justify-between gap-3 ${
                    index === activeIndex
                      ? "bg-gray-700 text-white border-l-2 border-cyan-400"
                      : "text-gray-300 hover:bg-gray-800 border-l-2 border-transparent"
                  }`}
                  onClick={() => onSelect(item.value)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap font-bold text-cyan-300">{item.titleId}</span>
                      <span className="truncate text-sm">{item.label}</span>
                      {item.locked && <span className="shrink-0 text-[10px] font-bold tracking-[0.2em] text-amber-400">LOCKED</span>}
                    </div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </li>
      ) : (
        Array.from(new Set(items.map((item) => item.type === "command" ? item.groupTitle : ""))).map((groupTitle) => (
          <li key={groupTitle}>
            <div className="px-3 pb-1 pt-2 text-[10px] font-bold tracking-[0.24em] text-cyan-500/80 first:pt-1 select-none">
              {groupTitle}
            </div>
            <ul>
              {items.map((item, index) => {
                if (item.type !== "command" || item.groupTitle !== groupTitle) return null;

                return (
                  <li
                    key={item.value}
                    className={`px-3 py-1 cursor-pointer flex items-center justify-between gap-2 sm:gap-4 ${
                      index === activeIndex
                        ? "bg-gray-700 text-white border-l-2 border-cyan-400"
                        : "text-gray-300 hover:bg-gray-800 border-l-2 border-transparent"
                    }`}
                    onClick={() => onSelect(item.value)}
                  >
                    <span className={`whitespace-nowrap ${item.value === "/backlog" || item.value === "/model" || item.value === "/promote" ? "font-bold text-yellow-400" : ""}`}>
                      {item.value}
                      {item.argumentHint && <span className="ml-1 text-xs font-normal text-gray-500"> {item.argumentHint}</span>}
                    </span>
                    {item.description && (
                      <span className="text-gray-500 text-xs truncate min-w-0">{item.description}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))
      )}
    </ul>
  );
}

export default SlashMenu;
