import { ChangeEvent, KeyboardEvent, forwardRef, useState } from "react";

type CommandLineProps = {
  value: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  promptString?: string;
  placeholder?: string;
  assistivePlaceholderHint?: string;
};

const CommandLine = forwardRef<HTMLInputElement, CommandLineProps>(
  function CommandLine(
    { value, disabled, onChange, onKeyDown, promptString = "❯ ", placeholder, assistivePlaceholderHint },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const showPlaceholder = !value && !!placeholder;
    const showTabHint = showPlaceholder && !disabled;
    const showDecorativeCursor = showPlaceholder && isFocused && !disabled;
    const hideNativeCaret = showDecorativeCursor;
    const accessiblePlaceholder =
      placeholder && assistivePlaceholderHint && !disabled
        ? `${placeholder}. ${assistivePlaceholderHint}`
        : placeholder;
    const leadingPlaceholderChar = placeholder?.charAt(0) ?? "";
    const trailingPlaceholderText = placeholder?.slice(1) ?? "";

    const handleCompositionStart = () => {
      setIsComposing(true);
    };

    const handleCompositionEnd = () => {
      setIsComposing(false);
    };

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (isComposing || e.nativeEvent.isComposing) {
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
                <span data-testid="command-line-suggested-reply" className="min-w-0 truncate">
                  <span
                    data-testid="command-line-suggested-reply-leading-char"
                    className="terminal-command-placeholder-leading-char"
                  >
                    {showDecorativeCursor && <span data-testid="command-line-cursor" className="terminal-command-cursor" />}
                    <span className="terminal-command-placeholder-leading-char-text">{leadingPlaceholderChar}</span>
                  </span>
                  <span>{trailingPlaceholderText}</span>
                </span>
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
              className={`terminal-command-input relative z-10 w-full outline-none bg-transparent text-white font-bold disabled:opacity-50 py-0 leading-none ${hideNativeCaret ? "terminal-command-input-caret-hidden" : "caret-white"}`}
              autoFocus
            />
          </div>
        </div>
      </div>
    );
  }
);

export default CommandLine;
