import { useState } from "react";
import { useAdminApi } from "../hooks/useAdminApi";
import { API_BASE } from "../config";

interface BacklogItem {
  id: string;
  title: string;
  description: string;
  technical_debt: number;
  kickoff_prompt: string;
}

interface BacklogForm {
  title: string;
  description: string;
  technical_debt: number;
  kickoff_prompt: string;
}

const emptyForm: BacklogForm = { title: "", description: "", technical_debt: 0, kickoff_prompt: "" };

export default function Backlog() {
  const { data, isLoading, isError, mutate } = useAdminApi<BacklogItem[]>("/api/backlog");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BacklogForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(item: BacklogItem) {
    setEditingId(item.id);
    setForm({
      title: item.title ?? "",
      description: item.description ?? "",
      technical_debt: item.technical_debt ?? 0,
      kickoff_prompt: item.kickoff_prompt ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      alert("Title is required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`${API_BASE}/api/backlog/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error(`Update failed: ${res.statusText}`);
      } else {
        const res = await fetch(`${API_BASE}/api/backlog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error(`Create failed: ${res.statusText}`);
      }
      await mutate();
      closeForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save item.");
    } finally {
      setSaving(false);
    }
  }

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backlog</h1>
        <button
          onClick={openCreate}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Item
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit Item" : "Add Item"}</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Technical Debt</label>
                <input
                  type="number"
                  value={form.technical_debt}
                  onChange={(e) => setForm({ ...form, technical_debt: Number(e.target.value) })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kickoff Prompt</label>
                <input
                  type="text"
                  value={form.kickoff_prompt}
                  onChange={(e) => setForm({ ...form, kickoff_prompt: e.target.value })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">TD</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                <td className="max-w-md truncate px-6 py-4 text-sm text-gray-700">{item.description}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{item.technical_debt}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
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
