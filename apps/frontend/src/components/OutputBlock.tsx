import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
      {message.role === "system" ? (
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              if (match) {
                return (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                  >
                    {codeString}
                  </SyntaxHighlighter>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      ) : (
        message.content
      )}
    </div>
  );
}

export default OutputBlock;
