import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { buildMarkdownComponents, cleanLLMOutput } from "./OutputBlockMarkdown";
import { extractBuddyInterjectionBlock } from "./buddyConstants";

type ShareCardRenderSurfaceProps = {
  prompt: string;
  response: string;
  username: string;
};

function ShareResponse({ response }: { response: string }) {
  const buddyBlock = extractBuddyInterjectionBlock(response);
  const body = buddyBlock ? buddyBlock.body : response;
  const markdownComponents = buildMarkdownComponents();

  return (
    <div className="mt-8 font-mono text-[16px] leading-[1.5] text-[#e6edf3]">
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
      className="h-[630px] w-[1200px] overflow-hidden bg-[#0d1117] text-white"
    >
      <div className="grid h-9 grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-[#30363d] bg-[#161b22] px-6 font-mono text-[14px] text-[#6e7681]">
        <img src="/media/logo-400-transparent.png" alt="Claude Cope" className="h-5 w-auto" />
        <div className="truncate text-center">{username}</div>
        <div className="text-[#facc15]">cope.bot</div>
      </div>
      <div className="h-[594px] overflow-hidden px-6 py-6">
        <div className="inline-block bg-[#e5e7eb] px-3 py-2 font-mono text-[16px] font-bold text-[#111827]">
          <span className="mr-2 text-[#6b7280]">❯</span>
          {prompt}
        </div>
        <ShareResponse response={response} />
      </div>
    </div>
  );
}
