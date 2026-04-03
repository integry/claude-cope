import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message } from "./Terminal";

const SPINNER_FRAMES = ["/", "-", "\\", "|"];

const roleColors: Record<Message["role"], string> = {
  user: "text-gray-300",
  system: "text-green-400",
  loading: "text-yellow-400",
  warning: "text-yellow-400",
  error: "text-red-500",
};

function Spinner() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f: number) => (f + 1) % SPINNER_FRAMES.length), 150);
    return () => clearInterval(id);
  }, []);
  return <span>{SPINNER_FRAMES[frame]} </span>;
}

function OutputBlock({ message, promptString = "cope@local:~$ " }: { message: Message; promptString?: string }) {
  const colorClass = roleColors[message.role];
  const isAchievement = message.role === "warning" && message.content.includes("ACHIEVEMENT UNLOCKED");
  const isBuddyInterjection = message.role === "warning" && message.content.includes("\n");

  return (
    <div className={`${colorClass} ${isAchievement ? "achievement-flash whitespace-pre font-bold" : isBuddyInterjection ? "whitespace-pre font-mono" : ""}`}>
      {message.role === "user" && (
        <span className="text-gray-500">{promptString}</span>
      )}
      {message.role === "loading" && <Spinner />}
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
