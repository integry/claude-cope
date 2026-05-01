import { useState } from "react";
import { useAdminApi, adminFetch } from "../hooks/useAdminApi";
import { API_BASE } from "../config";
import { SENSITIVE_KEYS, PRESERVE_VALUE_SENTINEL } from "@claude-cope/shared/config";
import { ConfigFormPanel, ConfirmDeleteModal, TierBadge } from "./ConfigurationParts";
import { emptyForm, type ConfigEntry, type ConfigForm } from "./configurationShared";

export default function Configuration() {
  const { data, isLoading, isError, mutate } = useAdminApi<ConfigEntry[]>("/api/config");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{ key: string; tier: string } | null>(null);
  const [form, setForm] = useState<ConfigForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfigEntry | null>(null);
  const [filter, setFilter] = useState("");

  function openCreate() {
    setEditingEntry(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(entry: ConfigEntry) {
    setEditingEntry({ key: entry.key, tier: entry.tier });
    setForm({
      key: entry.key,
      tier: entry.tier,
      value: SENSITIVE_KEYS.has(entry.key) ? "" : entry.value,
      description: entry.description ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEntry(null);
    setForm(emptyForm);
    setSaveError(null);
  }

  async function handleSave() {
    if (!form.key.trim()) {
      setSaveError("Key is required.");
      return;
    }
    const isSensitiveEdit = editingEntry && SENSITIVE_KEYS.has(form.key);
    if (!isSensitiveEdit && !form.value.trim()) {
      setSaveError("Value is required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const key = encodeURIComponent(form.key.trim());
      const tier = encodeURIComponent(form.tier.trim() || "*");
      const effectiveValue = isSensitiveEdit && !form.value.trim() ? PRESERVE_VALUE_SENTINEL : form.value;
      await adminFetch(`${API_BASE}/api/config/${key}/${tier}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: effectiveValue,
          description: form.description || undefined,
        }),
      });
      await mutate();
      closeForm();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(entry: ConfigEntry) {
    setDeleteError(null);
    setConfirmDelete(entry);
  }

  async function executeDelete() {
    if (!confirmDelete) return;
    const entry = confirmDelete;
    const entryId = `${entry.key}:${entry.tier}`;
    setDeletingEntry(entryId);
    setDeleteError(null);
    try {
      const key = encodeURIComponent(entry.key);
      const tier = encodeURIComponent(entry.tier);
      await adminFetch(`${API_BASE}/api/config/${key}/${tier}`, {
        method: "DELETE",
      });
      await mutate();
      setConfirmDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete configuration.");
    } finally {
      setDeletingEntry(null);
    }
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Configuration</h1>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Configuration</h1>
        <p className="mt-4 text-red-600">Failed to load configuration.</p>
      </div>
    );
  }

  const filtered = filter
    ? data?.filter(
        (e) =>
          e.key.toLowerCase().includes(filter.toLowerCase()) ||
          e.tier.toLowerCase().includes(filter.toLowerCase()) ||
          (e.description ?? "").toLowerCase().includes(filter.toLowerCase())
      )
    : data;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuration</h1>
        <button
          onClick={openCreate}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Setting
        </button>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        Manage API keys, model settings, and feature flags. Settings use a composite key of name + tier,
        where tier &quot;*&quot; applies globally.
      </p>

      {showForm && (
        <ConfigFormPanel
          editingEntry={editingEntry}
          form={form}
          setForm={setForm}
          saving={saving}
          saveError={saveError}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      <div className="mt-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by key, tier, or description..."
          className="block w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tier</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered && filtered.length > 0 ? (
              filtered.map((entry) => {
                const entryId = `${entry.key}:${entry.tier}`;
                return (
                  <tr key={entryId}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-mono font-medium text-gray-900">
                      {entry.key}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      <TierBadge tier={entry.tier} />
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm font-mono text-gray-700">
                      {entry.value}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">
                      {entry.description ?? ""}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {entry.updated_at}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(entry)}
                          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => requestDelete(entry)}
                          disabled={deletingEntry === entryId}
                          className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingEntry === entryId ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No configuration entries found.{" "}
                  <button onClick={openCreate} className="text-blue-600 hover:underline">
                    Add one
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <ConfirmDeleteModal
          entry={confirmDelete}
          deleting={deletingEntry !== null}
          deleteError={deleteError}
          onConfirm={executeDelete}
          onCancel={() => { setConfirmDelete(null); setDeleteError(null); }}
        />
      )}
    </div>
  );
}
