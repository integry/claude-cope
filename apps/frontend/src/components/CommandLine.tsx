import { ChangeEvent, KeyboardEvent, forwardRef } from "react";

type CommandLineProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
};

const CommandLine = forwardRef<HTMLInputElement, CommandLineProps>(
  function CommandLine({ value, onChange, onKeyDown }, ref) {
    return (
      <div className="flex items-center">
        <span className="text-gray-500 whitespace-pre">cope@local:~$ </span>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="flex-1 outline-none bg-transparent text-gray-300 caret-gray-300"
          autoFocus
        />
      </div>
    );
  }
);

export default CommandLine;
