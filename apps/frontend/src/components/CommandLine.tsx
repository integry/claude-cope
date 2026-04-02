import { ChangeEvent, KeyboardEvent, forwardRef } from "react";

type CommandLineProps = {
  value: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
};

const CommandLine = forwardRef<HTMLInputElement, CommandLineProps>(
  function CommandLine({ value, disabled, onChange, onKeyDown }, ref) {
    return (
      <div className="flex items-center">
        <span className="text-gray-500 whitespace-pre">cope@local:~$ </span>
        <input
          ref={ref}
          type="text"
          value={value}
          disabled={disabled}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="flex-1 outline-none bg-transparent text-gray-300 caret-gray-300 disabled:opacity-50"
          autoFocus
        />
      </div>
    );
  }
);

export default CommandLine;
