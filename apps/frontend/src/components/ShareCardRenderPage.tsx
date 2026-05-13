import { useEffect, useState } from "react";
import ShareCard from "./ShareCard";
import { getShareCard, type ShareCardRecord } from "../api/shareCards";

function getShareIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/share-card-render\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export default function ShareCardRenderPage() {
  const [record, setRecord] = useState<ShareCardRecord | null>(null);
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const shareId = getShareIdFromPath(window.location.pathname);
    if (!shareId) {
      setStatus("error");
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
      <ShareCard
        prompt={record.prompt}
        response={record.response}
        username={record.username}
        theme={record.theme}
      />
    </div>
  );
}
