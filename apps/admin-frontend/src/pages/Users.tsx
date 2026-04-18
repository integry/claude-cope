import { useState, useMemo } from "react";
import { useAdminApi } from "../hooks/useAdminApi";
import { API_BASE } from "../config";

interface User {
  username: string;
  corporate_rank: number;
  country: string;
  total_td: number;
  current_td: number;
  credits_used: number;
  credits_remaining: number;
}

interface UserForm {
  username: string;
  corporate_rank: number;
  country: string;
  total_td: number;
  current_td: number;
}

type SortField = "total_td" | "credits_used" | null;
type SortDir = "asc" | "desc";

const emptyForm: UserForm = { username: "", corporate_rank: 0, country: "", total_td: 0, current_td: 0 };

export default function Users() {
  const { data, isLoading, isError, mutate } = useAdminApi<User[]>("/api/users");
  const [resettingUser, setResettingUser] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const sortedData = useMemo(() => {
    if (!data) return [];
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [data, sortField, sortDir]);

  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(user: User) {
    setEditingUser(user.username);
    setForm({
      username: user.username,
      corporate_rank: user.corporate_rank ?? 0,
      country: user.country ?? "",
      total_td: user.total_td ?? 0,
      current_td: user.current_td ?? 0,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingUser(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.username.trim()) {
      alert("Username is required.");
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const updateBody: Record<string, string | number> = {
            corporate_rank: form.corporate_rank,
            country: form.country,
            total_td: form.total_td,
            current_td: form.current_td,
          };
        if (form.username.trim() !== editingUser) {
          updateBody.username = form.username.trim();
        }
        const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(editingUser)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateBody),
        });
        if (!res.ok) throw new Error(`Update failed: ${res.statusText}`);
      } else {
        const res = await fetch(`${API_BASE}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            corporate_rank: form.corporate_rank,
            country: form.country,
          }),
        });
        if (!res.ok) throw new Error(`Create failed: ${res.statusText}`);
      }
      await mutate();
      closeForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset(username: string) {
    if (!confirm(`Are you sure you want to reset the score for "${username}"?`)) {
      return;
    }

    setResettingUser(username);
    try {
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}/reset`, {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={openCreate}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add User
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{editingUser ? "Edit User" : "Add User"}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rank</label>
              <input
                type="number"
                value={form.corporate_rank}
                onChange={(e) => setForm({ ...form, corporate_rank: Number(e.target.value) })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            {editingUser && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total TD</label>
                  <input
                    type="number"
                    value={form.total_td}
                    onChange={(e) => setForm({ ...form, total_td: Number(e.target.value) })}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current TD</label>
                  <input
                    type="number"
                    value={form.current_td}
                    onChange={(e) => setForm({ ...form, current_td: Number(e.target.value) })}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={closeForm}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Country</th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-900"
                onClick={() => toggleSort("total_td")}
              >
                Total TD {sortField === "total_td" ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Current TD</th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-900"
                onClick={() => toggleSort("credits_used")}
              >
                Credits Used {sortField === "credits_used" ? (sortDir === "desc" ? "\u2193" : "\u2191") : ""}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Credits Left</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((user) => (
              <tr key={user.username}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.corporate_rank}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.country}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.total_td}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.current_td}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.credits_used}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{user.credits_remaining}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleReset(user.username)}
                      disabled={resettingUser === user.username}
                      className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {resettingUser === user.username ? "Resetting..." : "Reset"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
