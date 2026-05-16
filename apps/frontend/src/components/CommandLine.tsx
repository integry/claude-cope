import { ChangeEvent, KeyboardEvent, MouseEvent, PointerEvent, forwardRef, useEffect, useState } from "react";
import { useIsMobileViewport } from "./useIsMobileViewport";

type CommandLineProps = {
  value: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
  promptString?: string;
  placeholder?: string;
  assistivePlaceholderHint?: string;
  onPlaceholderAccept?: (options?: { submit?: boolean }) => void;
};

type PlaceholderMetadata = {
  accessiblePlaceholder?: string;
  leadingPlaceholderChar: string;
  tabHintAriaLabel: string;
  tabHintLabel: string;
  trailingPlaceholderText: string;
};

function getPlaceholderMetadata(
  placeholder: string | undefined,
  assistivePlaceholderHint: string | undefined,
  disabled: boolean | undefined,
  isMobileViewport: boolean
): PlaceholderMetadata {
  const tabHintLabel = isMobileViewport ? "[Tap]" : "[Tab]";
  const tabHintAriaLabel = isMobileViewport ? "Tap to accept suggestion" : "Tab to accept suggestion";
  const placeholderHint = assistivePlaceholderHint
    ? isMobileViewport
      ? assistivePlaceholderHint.replace(/\bTab\b/g, "Tap")
      : assistivePlaceholderHint
    : undefined;

  return {
    accessiblePlaceholder:
      placeholder && placeholderHint && !disabled
        ? `${placeholder}. ${placeholderHint}`
        : placeholder,
    leadingPlaceholderChar: placeholder?.charAt(0) ?? "",
    tabHintAriaLabel,
    tabHintLabel,
    trailingPlaceholderText: placeholder?.slice(1) ?? "",
  };
}

function getCommandRowClassName(isFocused: boolean, disabled: boolean | undefined): string {
  return `terminal-command-row flex items-center gap-1.5 ${isFocused && !disabled ? "terminal-command-row-active" : ""} ${disabled ? "terminal-command-row-disabled" : ""}`;
}

function getTabHintClassName(isMobileViewport: boolean): string {
  return isMobileViewport
    ? "terminal-command-tab-hint pointer-events-auto relative z-20 ml-3 -my-[0.85rem] -mr-[0.9rem] flex min-w-[5.75rem] self-stretch items-center justify-center px-4 pt-[0.1rem] pb-0"
    : "terminal-command-tab-hint shrink-0 pointer-events-auto relative z-20";
}

const CommandLine = forwardRef<HTMLInputElement, CommandLineProps>(
  function CommandLine(
    {
      value,
      disabled,
      onChange,
      onKeyDown,
      onSubmit,
      promptString = "❯ ",
      placeholder,
      assistivePlaceholderHint,
      onPlaceholderAccept,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const isMobileViewport = useIsMobileViewport();
    const isInputFocused = isFocused && !disabled;
    const showPlaceholder = !value && !!placeholder;
    const showTabHint = showPlaceholder && !disabled;
    const showMobileSendButton = isMobileViewport && !!value && !disabled;
    const showDecorativeCursor = showPlaceholder && !disabled;
    const hideNativeCaret = showDecorativeCursor && isInputFocused;
    const { accessiblePlaceholder, leadingPlaceholderChar, tabHintAriaLabel, tabHintLabel, trailingPlaceholderText } =
      getPlaceholderMetadata(placeholder, assistivePlaceholderHint, disabled, isMobileViewport);
    const commandRowClassName = getCommandRowClassName(isInputFocused, disabled);
    const tabHintClassName = getTabHintClassName(isMobileViewport);

    useEffect(() => {
      if (disabled && isFocused) {
        setIsFocused(false);
      }
    }, [disabled, isFocused]);

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

    const handlePlaceholderAccept = () => {
      if (!showTabHint || !onPlaceholderAccept) {
        return;
      }
      onPlaceholderAccept({ submit: isMobileViewport });
    };

    const keepInputFocus = (event: MouseEvent<HTMLButtonElement> | PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

    return (
      <div className="terminal-command-line border-t border-white/20">
        <div className={commandRowClassName}>
          <span className="terminal-command-prompt font-bold whitespace-pre leading-none">{promptString}</span>
          <div className="flex flex-1 min-w-0 items-center self-stretch">
            <div className="relative flex-1 min-w-0 self-center">
              {showPlaceholder && (
                <div
                  aria-hidden="true"
                  data-testid="command-line-placeholder"
                  className="terminal-command-placeholder pointer-events-none absolute inset-0 flex items-center gap-2 overflow-hidden whitespace-nowrap"
                >
                  <span data-testid="command-line-suggested-reply" className="flex-1 min-w-0 truncate">
                    <span
                      data-testid="command-line-suggested-reply-leading-char"
                      className="terminal-command-placeholder-leading-char"
                    >
                      {showDecorativeCursor && (
                        <span
                          data-testid="command-line-cursor"
                          className={`terminal-command-cursor ${isInputFocused ? "terminal-command-cursor-blinking" : ""}`}
                        />
                      )}
                      <span className="terminal-command-placeholder-leading-char-text">{leadingPlaceholderChar}</span>
                    </span>
                    <span>{trailingPlaceholderText}</span>
                  </span>
                  {showTabHint && (
                    <button
                      type="button"
                      data-testid="command-line-tab-hint"
                      className={tabHintClassName}
                      onMouseDown={keepInputFocus}
                      onPointerDown={keepInputFocus}
                      onClick={handlePlaceholderAccept}
                      aria-label={tabHintAriaLabel}
                    >
                      {tabHintLabel}
                    </button>
                  )}
                </div>
              )}
              <input
                ref={ref}
                type="text"
                value={value}
                autoFocus={!isMobileViewport}
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
              />
            </div>
            {showMobileSendButton && (
              <button
                type="button"
                data-testid="command-line-send-button"
                className="terminal-command-send-button -my-[0.85rem] -mr-[0.9rem] ml-3 flex min-w-[5.75rem] self-stretch items-center justify-center px-4 pt-[0.1rem] pb-0"
                onMouseDown={keepInputFocus}
                onPointerDown={keepInputFocus}
                onClick={onSubmit}
                aria-label="Send command"
              >
                [ ↵ ]
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default CommandLine;
