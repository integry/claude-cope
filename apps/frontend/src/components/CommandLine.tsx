import { ChangeEvent, KeyboardEvent, forwardRef, useState } from "react";

type CommandLineProps = {
  value: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  promptString?: string;
  placeholder?: string;
};

const CommandLine = forwardRef<HTMLInputElement, CommandLineProps>(
  function CommandLine({ value, disabled, onChange, onKeyDown, promptString = "❯ ", placeholder }, ref) {
    const [isFocused, setIsFocused] = useState(false);
    const showPlaceholder = !value && !!placeholder;
    const showDecorativeCursor = showPlaceholder && isFocused && !disabled;

    return (
      <div className="terminal-command-line border-t border-white/20">
        <div className={`terminal-command-row flex items-center gap-3 ${isFocused && !disabled ? "terminal-command-row-active" : ""} ${disabled ? "terminal-command-row-disabled" : ""}`}>
          <span className="terminal-command-prompt font-bold whitespace-pre leading-none">{promptString}</span>
          <div className="relative flex-1 min-w-0">
            {showPlaceholder && (
              <div
                aria-hidden="true"
                data-testid="command-line-placeholder"
                className="terminal-command-placeholder pointer-events-none absolute inset-0 flex items-center gap-2 overflow-hidden whitespace-nowrap"
              >
                {showDecorativeCursor && <span data-testid="command-line-cursor" className="terminal-command-cursor shrink-0" />}
                <span className="truncate">{placeholder}</span>
                <span data-testid="command-line-tab-hint" className="terminal-command-tab-hint shrink-0">
                  [Tab]
                </span>
              </div>
            )}
            <input
              ref={ref}
              type="text"
              value={value}
              disabled={disabled}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="terminal-command-input relative z-10 w-full outline-none bg-transparent text-white font-bold caret-white disabled:opacity-50 py-0 leading-none"
              autoFocus
            />
          </div>
        </div>
      </div>
    );
  }
);

export default CommandLine;
