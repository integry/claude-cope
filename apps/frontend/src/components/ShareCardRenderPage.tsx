import { useEffect, useState } from "react";
import ShareCardRenderSurface from "./ShareCardRenderSurface";
import { getShareCard, type ShareCardRecord } from "../api/shareCards";

function getShareIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/share-card-render\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function getInlineRecord(search: string, shareId: string): ShareCardRecord | null {
  const params = new URLSearchParams(search);
  const prompt = params.get("p");
  const response = params.get("r");
  const username = params.get("u");
  if (!prompt || !response || !username) return null;

  return {
    shareId,
    prompt,
    response,
    username,
    theme: params.get("t"),
    rendererVersion: "inline",
  };
}

export default function ShareCardRenderPage() {
  const initialShareId = getShareIdFromPath(window.location.pathname);
  const [record, setRecord] = useState<ShareCardRecord | null>(() => {
    if (!initialShareId) return null;
    return getInlineRecord(window.location.search, initialShareId);
  });
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const shareId = getShareIdFromPath(window.location.pathname);
    if (!shareId) {
      setStatus("error");
      return;
    }

    const inlineRecord = getInlineRecord(window.location.search, shareId);
    if (inlineRecord) {
      setRecord(inlineRecord);
      return;
    }

    let cancelled = false;
    getShareCard(shareId)
      .then((next) => {
        if (cancelled) return;
        setRecord(next);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!record) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-300 font-mono flex items-center justify-center p-6">
        <div className="border border-cyan-400/20 bg-black/30 px-4 py-3 text-sm">
          {status === "loading" ? "[loading share card]" : "[share card unavailable]"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-0">
      <ShareCardRenderSurface
        prompt={record.prompt}
        response={record.response}
        username={record.username}
      />
    </div>
  );
}
