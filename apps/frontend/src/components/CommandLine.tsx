import { ChangeEvent, KeyboardEvent, forwardRef } from "react";

type CommandLineProps = {
  value: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  promptString?: string;
};

const CommandLine = forwardRef<HTMLInputElement, CommandLineProps>(
  function CommandLine({ value, disabled, onChange, onKeyDown, promptString = "❯ " }, ref) {
    return (
      <div className="border-t border-white py-1.5">
        <div className="flex items-center">
          <span className="text-white font-bold whitespace-pre">{promptString}</span>
          <input
            ref={ref}
            type="text"
            value={value}
            disabled={disabled}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="flex-1 outline-none bg-transparent text-white font-bold caret-white disabled:opacity-50"
            autoFocus
          />
        </div>
      </div>
    );
  }
);

export default CommandLine;
