import { useState } from "react";
import { useAdminApi } from "../hooks/useAdminApi";
import { API_BASE } from "../config";
import { SENSITIVE_KEYS, CATEGORY_KEYS, VALID_CATEGORY_TIERS, GLOBAL_ONLY_KEYS } from "@claude-cope/shared/config";

interface ConfigEntry {
  key: string;
  tier: string;
  value: string;
  description: string | null;
  updated_at: string;
}

interface ConfigForm {
  key: string;
  tier: string;
  value: string;
  description: string;
}

const emptyForm: ConfigForm = { key: "", tier: "*", value: "", description: "" };

const WELL_KNOWN_KEYS = [
  { key: "openrouter_api_key", description: "OpenRouter API key for LLM requests" },
  { key: "openrouter_providers", description: "Preferred OpenRouter providers (comma-separated)" },
  { key: "openrouter_providers_free_only", description: "Apply provider preference to free tier only (true/false)" },
  { key: "turnstile_secret_key", description: "Cloudflare Turnstile secret key" },
  { key: "free_quota_limit", description: "Per-session free-tier request allowance" },
  { key: "pro_initial_quota", description: "Per-license Pro-tier initial request allowance" },
  { key: "model_multiplier", description: "Credit multiplier override for a model (tier = model ID)" },
  { key: "enable_ticket_refine", description: "Enable ticket refinement endpoint (true/false)" },
  { key: "enable_byok", description: "Enable Bring Your Own Key feature (true/false)" },
  { key: "category_model", description: "OpenRouter model ID for a request category (tier = max/free/depleted)" },
  { key: "category_api_key", description: "OpenRouter API key for a request category (tier = max/free/depleted)" },
];

function maskValue(key: string, value: string): string {
  if (!SENSITIVE_KEYS.has(key)) return value;
  if (value.length <= 4) return "••••";
  return "••••" + value.slice(-4);
}

export default function Configuration() {
  const { data, isLoading, isError, mutate } = useAdminApi<ConfigEntry[]>("/api/config");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{ key: string; tier: string } | null>(null);
  const [form, setForm] = useState<ConfigForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);
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
  }

  function selectWellKnownKey(key: string) {
    const known = WELL_KNOWN_KEYS.find((k) => k.key === key);
    setForm({
      ...form,
      key,
      tier: GLOBAL_ONLY_KEYS.has(key) ? "*" : form.tier,
      description: known?.description ?? form.description,
    });
  }

  async function handleSave() {
    if (!form.key.trim()) {
      alert("Key is required.");
      return;
    }
    const isSensitiveEdit = editingEntry && SENSITIVE_KEYS.has(form.key);
    if (!isSensitiveEdit && !form.value.trim()) {
      alert("Value is required.");
      return;
    }
    setSaving(true);
    try {
      const key = encodeURIComponent(form.key.trim());
      const tier = encodeURIComponent(form.tier.trim() || "*");
      const res = await fetch(`${API_BASE}/api/config/${key}/${tier}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: form.value,
          description: form.description || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Save failed: ${res.statusText}`);
      }
      await mutate();
      closeForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entry: ConfigEntry) {
    if (!confirm(`Delete "${entry.key}" (tier: ${entry.tier})?`)) return;

    const entryId = `${entry.key}:${entry.tier}`;
    setDeletingEntry(entryId);
    try {
      const key = encodeURIComponent(entry.key);
      const tier = encodeURIComponent(entry.tier);
      const res = await fetch(`${API_BASE}/api/config/${key}/${tier}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Delete failed: ${res.statusText}`);
      }
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete configuration.");
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
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingEntry ? "Edit Setting" : "Add Setting"}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Key</label>
              {editingEntry ? (
                <input
                  type="text"
                  value={form.key}
                  disabled
                  className="mt-1 block w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm shadow-sm"
                />
              ) : (
                <div className="mt-1 flex gap-2">
                  <select
                    value={WELL_KNOWN_KEYS.some((k) => k.key === form.key) ? form.key : ""}
                    onChange={(e) => {
                      if (e.target.value) selectWellKnownKey(e.target.value);
                    }}
                    className="block rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Select preset --</option>
                    {WELL_KNOWN_KEYS.map((k) => (
                      <option key={k.key} value={k.key}>
                        {k.key}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    placeholder="or type a custom key"
                    className="block flex-1 rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tier</label>
                {CATEGORY_KEYS.has(form.key) && !editingEntry ? (
                  <select
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {VALID_CATEGORY_TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t === "*" ? "* (global)" : t}
                      </option>
                    ))}
                  </select>
                ) : GLOBAL_ONLY_KEYS.has(form.key) ? (
                  <input
                    type="text"
                    value="*"
                    disabled
                    className="mt-1 block w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm shadow-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    disabled={!!editingEntry}
                    placeholder="* (global)"
                    className={`mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none ${
                      editingEntry ? "bg-gray-100" : ""
                    }`}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={editingEntry && SENSITIVE_KEYS.has(form.key) ? "Leave empty to keep current value" : ""}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
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
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.tier === "*"
                            ? "bg-gray-100 text-gray-800"
                            : entry.tier === "free"
                              ? "bg-green-100 text-green-800"
                              : entry.tier === "pro" || entry.tier === "max"
                                ? "bg-blue-100 text-blue-800"
                                : entry.tier === "depleted"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {entry.tier}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm font-mono text-gray-700">
                      {maskValue(entry.key, entry.value)}
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
                          onClick={() => handleDelete(entry)}
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
    </div>
  );
}
