import { useEffect, useRef } from "react";
import {
  formatCount,
  formatTimestamp,
  leaderboardSections,
  totalCards,
  truncateUrl,
  type ShareFeedItem,
  type SharesOverview,
} from "./SharedImagesShared";

export function SummaryCards({ overview }: { overview: SharesOverview }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {totalCards.map((card) => (
        <div
          key={card.key}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {formatCount(overview.totals[card.key])}
          </p>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardGrid({
  overview,
  onUserSelect,
}: {
  overview: SharesOverview;
  onUserSelect: (username: string) => void;
}) {
  return (
    <div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Most Active Users</h3>
        <p className="mt-1 text-sm text-gray-500">Click a username to filter the activity feed.</p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {leaderboardSections.map((section) => (
          <div
            key={section.key}
            className="rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 px-6 py-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                {section.label}
              </h4>
            </div>
            <div className="px-6 py-3">
              {overview.topUsers[section.key].length > 0 ? (
                <ol className="divide-y divide-gray-100">
                  {overview.topUsers[section.key].map((user, index) => (
                    <li key={`${section.key}-${user.username}`} className="flex items-center justify-between gap-4 py-3">
                      <button
                        type="button"
                        onClick={() => onUserSelect(user.username)}
                        className="min-w-0 text-left text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
                      >
                        {index + 1}. {user.username}
                      </button>
                      <p className="shrink-0 text-sm text-gray-600">
                        {formatCount(user.shareCount)} shared image{user.shareCount === 1 ? "" : "s"}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-6 text-sm text-gray-500">No shared images in this time window yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeedTable({
  items,
  onPreview,
  onUserSelect,
}: {
  items: ShareFeedItem[];
  onPreview: (item: ShareFeedItem) => void;
  onUserSelect: (username: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Prompt</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Response</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Thumbnail</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.shareId} className="align-top">
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                  {formatTimestamp(item.createdAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                  <button
                    type="button"
                    onClick={() => onUserSelect(item.username)}
                    className="hover:text-blue-700 hover:underline"
                  >
                    {item.username}
                  </button>
                </td>
                <td className="max-w-xs px-4 py-4 text-sm text-gray-700">
                  <p className="whitespace-pre-wrap break-words">{item.promptPreview}</p>
                </td>
                <td className="max-w-sm px-4 py-4 text-sm text-gray-700">
                  <p className="whitespace-pre-wrap break-words">{item.responsePreview}</p>
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onPreview(item)}
                    className="block overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Preview shared image ${item.shareId}`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={`Shared image thumbnail by ${item.username}`}
                      className="h-20 w-32 object-cover"
                      loading="lazy"
                    />
                  </button>
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="flex flex-col items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onPreview(item)}
                      className="rounded border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Preview
                    </button>
                    <a
                      href={item.shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-blue-200 px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-50"
                    >
                      Open Share Page
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                  No shared images matched the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SharePreviewModal({
  item,
  onClose,
}: {
  item: ShareFeedItem;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="share-preview-title">
      <div ref={dialogRef} className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <h3 id="share-preview-title" className="text-lg font-semibold text-gray-900">
              Share Preview
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {item.username} · {formatTimestamp(item.createdAt)}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        <div className="grid gap-4 overflow-auto p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <img
              src={item.imageUrl}
              alt={`Shared image by ${item.username}`}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prompt</p>
              <p className="mt-1 text-sm text-gray-700">{item.promptPreview}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Response</p>
              <p className="mt-1 text-sm text-gray-700">{item.responsePreview}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Public Share</p>
              <a
                href={item.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {truncateUrl(item.shareUrl)}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
