import { useState } from "react";
import { useAdminApi } from "../hooks/useAdminApi";

interface License {
  id: string;
  key_hash: string;
  status: string;
  created_at: string;
  last_activated_at: string;
  username: string | null;
}

interface PaginatedLicenses {
  items: License[];
  total: number;
  limit: number;
  offset: number;
}

function formatTimestamp(raw: string | null | undefined): string {
  if (!raw) return "\u2014";
  // Append "Z" only when the string lacks a timezone indicator (Z, +HH:MM, etc.)
  const hasTimezone = /[Zz]$|[+-]\d{2}:\d{2}$/.test(raw);
  const d = new Date(hasTimezone ? raw : raw + "Z");
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const PAGE_SIZE = 50;

export default function Licenses() {
  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;
  const { data, isLoading, isError } = useAdminApi<PaginatedLicenses>(`/api/licenses?limit=${PAGE_SIZE}&offset=${offset}`);

  const licenses = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Licenses</h1>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Licenses</h1>
        <p className="mt-4 text-red-600">Failed to load licenses.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Licenses</h1>
        <p className="text-sm text-gray-500">
          Showing {total === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total} license{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Key Hash</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Activated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {licenses.map((license) => (
              <tr key={license.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-700">
                  {license.key_hash}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {license.status === "active" ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      {license.status}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {license.username ?? <span className="text-gray-400">Unlinked</span>}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {formatTimestamp(license.created_at)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {formatTimestamp(license.last_activated_at)}
                </td>
              </tr>
            ))}
            {licenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No licenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
