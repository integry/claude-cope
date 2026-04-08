import { ChangeEvent, KeyboardEvent, forwardRef } from "react";

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
    return (
      <div className="border-t border-white py-2">
        <div className="flex items-center">
          <span className="text-white font-bold whitespace-pre leading-none">{promptString}</span>
          <input
            ref={ref}
            type="text"
            value={value}
            disabled={disabled}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder ? `${placeholder}  [Tab]` : undefined}
            className="flex-1 outline-none bg-transparent text-white font-bold caret-white disabled:opacity-50 placeholder:text-gray-600 placeholder:font-normal py-0 leading-none"
            autoFocus
          />
        </div>
      </div>
    );
  }
);

export default CommandLine;
