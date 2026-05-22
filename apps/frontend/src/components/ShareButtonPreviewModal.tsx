import type { CSSProperties, RefObject } from "react";
import ShareCardRenderSurface from "./ShareCardRenderSurface";
import { isMacPlatform } from "./shareButtonBrowser";

type SharePlatform = "twitter" | "linkedin";
type PasteHintState =
  | { platform: "twitter"; method: "image" | "link" }
  | { platform: "linkedin" };
type ShareStatus = "idle" | "generating" | "copied" | "error";

const modalStyle: CSSProperties = { fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: "13px", lineHeight: "1.4", backgroundColor: "#1e232b", border: "2px solid #ff5555", boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.9)", maxWidth: "calc(100vw - 2rem)", maxHeight: "calc(100vh - 2rem)", overflow: "hidden", color: "#c9d1d9", display: "flex", flexDirection: "column" };
const modalHeaderStyle: CSSProperties = { padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ff5555" };
const modalTitleStyle: CSSProperties = { color: "#ff5555", fontWeight: "bold", fontSize: "11px" };
const closeButtonStyle: CSSProperties = { color: "#aaaaaa", cursor: "pointer", fontSize: "14px", background: "none", border: "none", padding: 0 };
const modalBodyStyle: CSSProperties = { padding: "12px", overflowY: "auto", overflowX: "hidden", maxHeight: "calc(100vh - 9rem)" };
const modalFooterStyle: CSSProperties = { borderTop: "1px solid #ff5555", padding: "10px 12px" };
const pasteHintStyle: CSSProperties = { fontSize: "12px", lineHeight: "1.6", textAlign: "left" };
const emphasisStyle: CSSProperties = { color: "#ff5555", fontWeight: "bold" };
const highlightStyle: CSSProperties = { color: "#ffff55" };
const actionRowStyle: CSSProperties = { display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" };
const linkStyle: CSSProperties = { background: "none", border: "none", padding: "8px 0 0 0", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", display: "block" };
const previewFrameStyle: CSSProperties = { display: "flex", justifyContent: "center", alignItems: "flex-start", overflow: "hidden", maxWidth: "100%" };
const previewScaleWrapStyle: CSSProperties = { width: "min(100%, 760px)" };
const previewSurfaceStyle: CSSProperties = { width: "100%" };
const previewLoadingSurfaceStyle: CSSProperties = { minHeight: "240px", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "12px", color: "#ffff55", textAlign: "center" };
const previewLoadingSpinnerStyle: CSSProperties = { fontSize: "32px", lineHeight: 1, fontWeight: "bold" };
const previewLoadingTextStyle: CSSProperties = { fontSize: "12px", lineHeight: "1.6" };
const modalStatusStyle: CSSProperties = { fontSize: "12px", textAlign: "left" };
const modalStatusGeneratingStyle: CSSProperties = { ...modalStatusStyle, color: "#ffff55" };
const modalStatusErrorStyle: CSSProperties = { ...modalStatusStyle, color: "#ff5555" };

const ACTIONS: Array<{ label: string; platform?: SharePlatform }> = [
  { label: "COPY IMAGE" },
  { label: "SHARE ON X", platform: "twitter" },
  { label: "SHARE ON LINKEDIN", platform: "linkedin" },
];
const NATIVE_SHARE_LABEL = "OPEN SHARE MENU";

export function ShareButtonInlineStatus({
  closePreview,
  feedback,
  spinnerChar,
  status,
}: {
  closePreview: () => void;
  feedback: string | null;
  spinnerChar: string;
  status: ShareStatus;
}) {
  if (status === "idle") return null;

  return (
    <span className="inline-flex items-center gap-2 ml-2 text-[11px] font-mono align-baseline">
      {status === "generating" ? <><span className="text-yellow-400 animate-pulse">{spinnerChar} {feedback}</span><button onClick={closePreview} className="font-mono text-[11px] text-gray-400 transition-colors hover:text-[#ff5555]">[cancel]</button></> : null}
      {status === "copied" ? <span className="text-green-400">{feedback}</span> : null}
      {status === "error" ? <span className="text-red-400">{feedback}</span> : null}
    </span>
  );
}

export type ShareButtonPreviewModel = {
  feedback: string | null;
  isGenerating: boolean;
  isMobileSharePreview: boolean;
  isPreviewImageLoading: boolean;
  pasteHint: PasteHintState | null;
  previewImageObjectUrl: string | null;
  spinnerChar: string;
  status: ShareStatus;
  systemMessage: string;
  useNativeSharePreview: boolean;
  userMessage: string;
  username: string;
};

export type ShareButtonPreviewActions = {
  closePreview: () => void;
  copyImage: () => void;
  nativeShare: () => void;
  openShareTarget: (platform: SharePlatform) => void;
  shareToPlatform: (platform: SharePlatform) => void;
  triggerFocus: () => void;
};

export function ShareButtonPreviewModal({
  actions,
  modalRef,
  preview,
}: {
  actions: ShareButtonPreviewActions;
  modalRef: RefObject<HTMLDivElement | null>;
  preview: ShareButtonPreviewModel;
}) {
  const { closePreview, copyImage, nativeShare, openShareTarget, shareToPlatform, triggerFocus } = actions;
  const { feedback, isGenerating, isMobileSharePreview, isPreviewImageLoading, pasteHint, previewImageObjectUrl, spinnerChar, status, systemMessage, useNativeSharePreview, userMessage, username } = preview;
  const showMobileLoadingPreview = isMobileSharePreview && isPreviewImageLoading && !previewImageObjectUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => { closePreview(); triggerFocus(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Share preview"
    >
      <div className="absolute inset-0 bg-black opacity-70" />
      <div
        ref={modalRef}
        className="relative z-10"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalHeaderStyle}>
          <span style={modalTitleStyle}>SHARE PREVIEW</span>
          <button onClick={() => { closePreview(); triggerFocus(); }} style={closeButtonStyle} aria-label="Close">[x]</button>
        </div>
        <div style={modalBodyStyle}>
          <div style={previewFrameStyle}>
            <div style={previewScaleWrapStyle}>
              <div style={previewSurfaceStyle}>
                {previewImageObjectUrl ? (
                  <img
                    src={previewImageObjectUrl}
                    alt={`Share preview for @${username}`}
                    className="block h-auto w-full"
                  />
                ) : showMobileLoadingPreview ? (
                  <div style={previewLoadingSurfaceStyle} aria-live="polite">
                    <div style={previewLoadingSpinnerStyle} className="animate-pulse">{spinnerChar}</div>
                    <div style={previewLoadingTextStyle}>Rendering final image...</div>
                  </div>
                ) : (
                  <ShareCardRenderSurface
                    prompt={userMessage}
                    response={systemMessage}
                    username={username}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div style={modalFooterStyle}>
          {pasteHint ? (
            <div style={pasteHintStyle}>
              <div style={emphasisStyle}>
                {pasteHint.platform === "twitter" ? (
                  <>
                    {pasteHint.method === "image" ? (
                      <>
                        <div>{"> [SYSTEM] IMAGE COPIED TO CLIPBOARD."}</div>
                        <div>
                          {"> MANDATORY ACTION: GO TO THE NEW TAB AND PRESS "}
                          <span style={highlightStyle}>{`[ ${isMacPlatform() ? "CMD" : "CTRL"} + V ]`}</span>
                          {" TO PASTE."}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>{"> [SYSTEM] SHARE LINK COPIED TO CLIPBOARD."}</div>
                        <div>{"> IMAGE COPY IS NOT SUPPORTED IN THIS BROWSER. OPEN X TO POST THE LINK."}</div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div>{"> [SYSTEM] LINKEDIN WILL SHARE THE PUBLIC LINK DIRECTLY."}</div>
                    <div>{"> ACTION: OPEN THE NEW TAB TO POST THE SHARE URL."}</div>
                  </>
                )}
              </div>
              <button onClick={() => openShareTarget(pasteHint.platform)} className="share-popup-action" style={linkStyle}>
                <span data-cursor="">{">"}</span>
                <span data-btn="">{` [ OPEN ${pasteHint.platform === "twitter" ? "X" : "LINKEDIN"} TAB ]`}</span>
              </button>
            </div>
          ) : isGenerating ? (
            <div style={modalStatusGeneratingStyle}>{spinnerChar} {feedback}</div>
          ) : isPreviewImageLoading ? (
            <div style={modalStatusGeneratingStyle}>{spinnerChar} Rendering final image...</div>
          ) : status === "error" && feedback ? (
            <div style={modalStatusErrorStyle}>{feedback}</div>
          ) : useNativeSharePreview ? (
            <div style={actionRowStyle}>
              <button
                onClick={nativeShare}
                disabled={isGenerating}
                className="share-popup-action"
                style={{ ...closeButtonStyle, padding: 0, cursor: isGenerating ? "not-allowed" : "pointer", fontSize: "12px", opacity: isGenerating ? 0.5 : 1 }}
              >
                <span data-cursor="">{">"}</span>
                <span data-btn="">{` [ ${NATIVE_SHARE_LABEL} ]`}</span>
              </button>
            </div>
          ) : (
            <div style={actionRowStyle}>
              {ACTIONS.map(({ label, platform }) => (
                <button
                  key={label}
                  onClick={platform ? () => shareToPlatform(platform) : copyImage}
                  disabled={isGenerating}
                  className="share-popup-action"
                  style={{ ...closeButtonStyle, padding: 0, cursor: isGenerating ? "not-allowed" : "pointer", fontSize: "12px", opacity: isGenerating ? 0.5 : 1 }}
                >
                  <span data-cursor="">{">"}</span>
                  <span data-btn="">{` [ ${label} ]`}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
