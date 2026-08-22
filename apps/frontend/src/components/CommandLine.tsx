import { ChangeEvent, CSSProperties, KeyboardEvent, MouseEvent, PointerEvent, forwardRef, useEffect, useState } from "react";
import { useIsMobileViewport } from "./useIsMobileViewport";

type CommandLineProps = {
  value: string;
  disabled?: boolean;
  autoFocus?: boolean;
  forceFocused?: boolean;
  blinkCursor?: boolean;
  cursorBlinkOn?: boolean;
  showNativeCaret?: boolean;
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

type CommandLineVisibilityState = {
  hideNativeCaret: boolean;
  isInputFocused: boolean;
  shouldAutoFocus: boolean;
  showDecorativeCursor: boolean;
  showEmptyDecorativeCursor: boolean;
  showMobileSendButton: boolean;
  showPlaceholder: boolean;
  showTabHint: boolean;
  showValueDecorativeCursor: boolean;
};

type PlaceholderOverlayProps = {
  cursorClassName: string;
  cursorStyle?: CSSProperties;
  leadingPlaceholderChar: string;
  onPlaceholderAccept: () => void;
  showDecorativeCursor: boolean;
  showTabHint: boolean;
  tabHintAriaLabel: string;
  tabHintClassName: string;
  tabHintLabel: string;
  trailingPlaceholderText: string;
  keepInputFocus: (event: MouseEvent<HTMLButtonElement> | PointerEvent<HTMLButtonElement>) => void;
};

type CursorOverlayProps = {
  className: string;
  cursorClassName: string;
  cursorStyle?: CSSProperties;
  testId: string;
};

type MobileSendButtonProps = {
  keepInputFocus: (event: MouseEvent<HTMLButtonElement> | PointerEvent<HTMLButtonElement>) => void;
  onSubmit?: () => void;
};

function getPlaceholderMetadata(
  placeholder: string | undefined,
  assistivePlaceholderHint: string | undefined,
  disabled: boolean | undefined,
  isMobileViewport: boolean,
  canAcceptPlaceholder: boolean,
): PlaceholderMetadata {
  const tabHintLabel = isMobileViewport ? "[Tap]" : "[Tab]";
  const tabHintAriaLabel = isMobileViewport ? "Tap to accept suggestion" : "Tab to accept suggestion";
  const placeholderHint = canAcceptPlaceholder && assistivePlaceholderHint
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

function getCommandLineVisibilityState({
  autoFocus,
  canAcceptPlaceholder,
  canSubmit,
  disabled,
  forceFocused,
  isFocused,
  isMobileViewport,
  placeholder,
  showNativeCaret,
  value,
}: {
  autoFocus?: boolean;
  canAcceptPlaceholder: boolean;
  canSubmit: boolean;
  disabled?: boolean;
  forceFocused?: boolean;
  isFocused: boolean;
  isMobileViewport: boolean;
  placeholder?: string;
  showNativeCaret: boolean;
  value: string;
}): CommandLineVisibilityState {
  const isInputFocused = (forceFocused ?? isFocused) && !disabled;
  const showPlaceholder = !value && !!placeholder;
  const showTabHint = showPlaceholder && !disabled && canAcceptPlaceholder;
  const showMobileSendButton = isMobileViewport && !!value && !disabled && canSubmit;
  const showDecorativeCursor = showPlaceholder && !disabled;
  const showEmptyDecorativeCursor = !showPlaceholder && !value && isInputFocused && !disabled && !showNativeCaret;
  const showValueDecorativeCursor = !!value && isInputFocused && !disabled && !showNativeCaret;
  const hideNativeCaret = (showDecorativeCursor && isInputFocused) || !showNativeCaret;
  const shouldAutoFocus = autoFocus ?? !isMobileViewport;

  return {
    hideNativeCaret,
    isInputFocused,
    shouldAutoFocus,
    showDecorativeCursor,
    showEmptyDecorativeCursor,
    showMobileSendButton,
    showPlaceholder,
    showTabHint,
    showValueDecorativeCursor,
  };
}

function PlaceholderOverlay({
  cursorClassName,
  cursorStyle,
  leadingPlaceholderChar,
  onPlaceholderAccept,
  showDecorativeCursor,
  showTabHint,
  tabHintAriaLabel,
  tabHintClassName,
  tabHintLabel,
  trailingPlaceholderText,
  keepInputFocus,
}: PlaceholderOverlayProps) {
  return (
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
          {showDecorativeCursor ? (
            <span
              data-testid="command-line-cursor"
              className={cursorClassName}
              style={cursorStyle}
            />
          ) : null}
          <span className="terminal-command-placeholder-leading-char-text">{leadingPlaceholderChar}</span>
        </span>
        <span>{trailingPlaceholderText}</span>
      </span>
      {showTabHint ? (
        <button
          type="button"
          data-testid="command-line-tab-hint"
          className={tabHintClassName}
          onMouseDown={keepInputFocus}
          onPointerDown={keepInputFocus}
          onClick={onPlaceholderAccept}
          aria-label={tabHintAriaLabel}
        >
          {tabHintLabel}
        </button>
      ) : null}
    </div>
  );
}

function CursorOverlay({ className, cursorClassName, cursorStyle, testId }: CursorOverlayProps) {
  return (
    <span
      aria-hidden="true"
      data-testid={testId}
      className={`${cursorClassName} ${className}`}
      style={cursorStyle}
    />
  );
}

function MobileSendButton({ keepInputFocus, onSubmit }: MobileSendButtonProps) {
  return (
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
  );
}

const CommandLine = forwardRef<HTMLInputElement, CommandLineProps>(
  function CommandLine(
    {
      value,
      disabled,
      autoFocus,
      forceFocused,
      blinkCursor = true,
      cursorBlinkOn,
      showNativeCaret = true,
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
    const canAcceptPlaceholder = !!onPlaceholderAccept;
    const canSubmit = !!onSubmit;
    const {
      hideNativeCaret,
      isInputFocused,
      shouldAutoFocus,
      showDecorativeCursor,
      showEmptyDecorativeCursor,
      showMobileSendButton,
      showPlaceholder,
      showTabHint,
      showValueDecorativeCursor,
    } = getCommandLineVisibilityState({
      autoFocus,
      canAcceptPlaceholder,
      canSubmit,
      disabled,
      forceFocused,
      isFocused,
      isMobileViewport,
      placeholder,
      showNativeCaret,
      value,
    });
    const { accessiblePlaceholder, leadingPlaceholderChar, tabHintAriaLabel, tabHintLabel, trailingPlaceholderText } =
      getPlaceholderMetadata(placeholder, assistivePlaceholderHint, disabled, isMobileViewport, canAcceptPlaceholder);
    const commandRowClassName = getCommandRowClassName(isInputFocused, disabled);
    const tabHintClassName = getTabHintClassName(isMobileViewport);
    const useDeterministicCursor = cursorBlinkOn !== undefined;
    const cursorClassName = `terminal-command-cursor ${!useDeterministicCursor && isInputFocused && blinkCursor ? "terminal-command-cursor-blinking" : ""}`;
    const cursorStyle = useDeterministicCursor ? { opacity: cursorBlinkOn ? 1 : 0 } : undefined;

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
      <div className="terminal-command-line">
        <div className={commandRowClassName}>
          <span
            className="terminal-command-prompt font-bold whitespace-pre leading-none"
            style={{ color: "var(--terminal-command-prompt-color, #f8fafc)" }}
          >
            {promptString}
          </span>
          <div className="flex flex-1 min-w-0 items-center self-stretch">
            <div className="relative flex-1 min-w-0 self-center">
              {showPlaceholder ? (
                <PlaceholderOverlay
                  cursorClassName={cursorClassName}
                  cursorStyle={cursorStyle}
                  leadingPlaceholderChar={leadingPlaceholderChar}
                  onPlaceholderAccept={handlePlaceholderAccept}
                  showDecorativeCursor={showDecorativeCursor}
                  showTabHint={showTabHint}
                  tabHintAriaLabel={tabHintAriaLabel}
                  tabHintClassName={tabHintClassName}
                  tabHintLabel={tabHintLabel}
                  trailingPlaceholderText={trailingPlaceholderText}
                  keepInputFocus={keepInputFocus}
                />
              ) : null}
              {showEmptyDecorativeCursor ? (
                <CursorOverlay
                  testId="command-line-empty-cursor"
                  className="pointer-events-none absolute left-0 top-1/2 z-20 -translate-y-1/2"
                  cursorClassName={cursorClassName}
                  cursorStyle={cursorStyle}
                />
              ) : null}
              {showValueDecorativeCursor ? (
                <CursorOverlay
                  testId="command-line-value-cursor"
                  className="pointer-events-none absolute top-1/2 z-20 -translate-y-1/2"
                  cursorClassName={cursorClassName}
                  cursorStyle={{ ...cursorStyle, left: `${value.length}ch` }}
                />
              ) : null}
              <input
                ref={ref}
                type="text"
                value={value}
                autoFocus={shouldAutoFocus}
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
            {showMobileSendButton ? <MobileSendButton keepInputFocus={keepInputFocus} onSubmit={onSubmit} /> : null}
          </div>
        </div>
      </div>
    );
  }
);

export default CommandLine;
