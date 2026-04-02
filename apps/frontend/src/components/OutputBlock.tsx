import type { Message } from "./Terminal";

const roleColors: Record<Message["role"], string> = {
  user: "text-gray-300",
  system: "text-green-400",
  loading: "text-yellow-400",
  warning: "text-yellow-400",
  error: "text-red-500",
};

function OutputBlock({ message }: { message: Message }) {
  const colorClass = roleColors[message.role];

  return (
    <div className={colorClass}>
      {message.role === "user" && (
        <span className="text-gray-500">cope@local:~$ </span>
      )}
      {message.content}
    </div>
  );
}

export default OutputBlock;
