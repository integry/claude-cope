import { useState } from "react";
import { useAdminApi } from "../hooks/useAdminApi";
import { API_BASE } from "../config";

interface BacklogItem {
  id: string;
  title: string;
  description: string;
}

export default function Backlog() {
  const { data, isLoading, isError, mutate } = useAdminApi<BacklogItem[]>("/api/backlog");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(item: BacklogItem) {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      const res = await fetch(`${API_BASE}/api/backlog/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Delete failed: ${res.statusText}`);
      }
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Backlog</h1>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Backlog</h1>
        <p className="mt-4 text-red-600">Failed to load backlog items.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Backlog</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
