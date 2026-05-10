import { ChangeEvent, CompositionEvent, KeyboardEvent, forwardRef, useState } from "react";

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
    const [isComposing, setIsComposing] = useState(false);
    const showPlaceholder = !value && !!placeholder;
    const showTabHint = showPlaceholder && !disabled;
    const showDecorativeCursor = showPlaceholder && isFocused && !disabled;
    const accessiblePlaceholder = placeholder ? `${placeholder}. Press Tab to accept suggestion.` : undefined;

    const handleCompositionStart = (_e: CompositionEvent<HTMLInputElement>) => {
      setIsComposing(true);
    };

    const handleCompositionEnd = (_e: CompositionEvent<HTMLInputElement>) => {
      setIsComposing(false);
    };

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && (isComposing || e.nativeEvent.isComposing)) {
        return;
      }
      onKeyDown(e);
    };

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
                {showTabHint && (
                  <span data-testid="command-line-tab-hint" className="terminal-command-tab-hint shrink-0">
                    [Tab]
                  </span>
                )}
              </div>
            )}
            <input
              ref={ref}
              type="text"
              value={value}
              disabled={disabled}
              onChange={onChange}
              onKeyDown={handleInputKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={accessiblePlaceholder}
              aria-label="Command line input"
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
