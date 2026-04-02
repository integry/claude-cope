import { ChangeEvent, KeyboardEvent } from "react";

type CommandLineProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
};

function CommandLine({ value, onChange, onKeyDown }: CommandLineProps) {
  return (
    <div className="flex items-center">
      <span className="text-gray-500 whitespace-pre">cope@local:~$ </span>
      <input
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

export default CommandLine;
