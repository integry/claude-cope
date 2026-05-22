import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { buildMarkdownComponents, cleanLLMOutput } from "./OutputBlockMarkdown";
import { extractBuddyInterjectionBlock } from "./buddyConstants";

type ShareCardRenderSurfaceProps = {
  prompt: string;
  response: string;
  username: string;
};

const ROOT_TEXT_SIZE_CLASS = "text-[21px]";
const HEADER_TEXT_SIZE_CLASS = "text-[20px]";

function buildShareCardMarkdownComponents() {
  return {
    ...buildMarkdownComponents(),
    h1({ children }: { children?: ReactNode }) {
      return <h1 className="mb-3 mt-4 border-b border-gray-700 pb-1 text-[27px] font-bold text-white">{children}</h1>;
    },
    h2({ children }: { children?: ReactNode }) {
      return <h2 className="mb-2 mt-3 text-[24px] font-bold text-white">{children}</h2>;
    },
    h3({ children }: { children?: ReactNode }) {
      return <h3 className="mb-2 mt-2 text-[21px] font-bold text-gray-200">{children}</h3>;
    },
  };
}

function ShareResponse({ response }: { response: string }) {
  const buddyBlock = extractBuddyInterjectionBlock(response);
  const body = buddyBlock ? buddyBlock.body : response;
  const markdownComponents = buildShareCardMarkdownComponents();

  return (
    <div className={`mt-5 font-mono ${ROOT_TEXT_SIZE_CLASS} leading-relaxed text-[#e6edf3]`}>
      {buddyBlock ? (
        <div className="space-y-4">
          <pre className="whitespace-pre-wrap text-[#fb923c]">{buddyBlock.block}</pre>
          {body ? (
            <ReactMarkdown components={markdownComponents} rehypePlugins={[rehypeSanitize]}>
              {cleanLLMOutput(body)}
            </ReactMarkdown>
          ) : null}
        </div>
      ) : (
        <ReactMarkdown components={markdownComponents} rehypePlugins={[rehypeSanitize]}>
          {cleanLLMOutput(response)}
        </ReactMarkdown>
      )}
    </div>
  );
}

export default function ShareCardRenderSurface({
  prompt,
  response,
  username,
}: ShareCardRenderSurfaceProps) {
  return (
    <div
      id="share-card-root"
      className={`w-[760px] overflow-hidden bg-[#0d1117] ${ROOT_TEXT_SIZE_CLASS} text-white`}
    >
      <div className={`grid h-9 grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-[#30363d] bg-[#161b22] px-6 font-mono ${HEADER_TEXT_SIZE_CLASS} text-[#6e7681]`}>
        <img src="/media/logo-400-transparent.png" alt="Claude Cope" className="h-5 w-auto" />
        <div className="truncate text-center">{username}</div>
        <div className="text-[#facc15]">cope.bot</div>
      </div>
      <div className="px-6 py-6">
        <div className={`inline-block max-w-full break-words bg-[#e5e7eb] px-3 py-1.5 font-mono ${ROOT_TEXT_SIZE_CLASS} font-bold text-[#111827]`}>
          <span className="mr-2 text-[#6b7280]">❯</span>
          {prompt}
        </div>
        <ShareResponse response={response} />
      </div>
    </div>
  );
}
