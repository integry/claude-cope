import { useState } from "react";
import { useAdminApi } from "../hooks/useAdminApi";
import { API_BASE } from "../config";

interface User {
  username: string;
  rank: number;
  country: string;
  totalTD: number;
  currentTD: number;
}

export default function Users() {
  const { data, isLoading, isError, mutate } = useAdminApi<User[]>("/api/users");
  const [resettingUser, setResettingUser] = useState<string | null>(null);

  async function handleReset(username: string) {
    if (!confirm(`Are you sure you want to reset the score for "${username}"?`)) {
      return;
    }

    setResettingUser(username);
    try {
      const res = await fetch(`${API_BASE}/api/users/${username}/reset`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Reset failed: ${res.statusText}`);
      }
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reset user.");
    } finally {
      setResettingUser(null);
    }
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-4 text-red-600">Failed to load users.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total TD</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Current TD</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.map((user) => (
              <tr key={user.username}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.rank}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.country}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.totalTD}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.currentTD}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <button
                    onClick={() => handleReset(user.username)}
                    disabled={resettingUser === user.username}
                    className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {resettingUser === user.username ? "Resetting..." : "Reset"}
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
