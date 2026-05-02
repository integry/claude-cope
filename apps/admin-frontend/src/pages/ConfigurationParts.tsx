import { SENSITIVE_KEYS, CATEGORY_KEYS, VALID_CATEGORY_TIERS, GLOBAL_ONLY_KEYS } from "@claude-cope/shared/config";
import { WELL_KNOWN_KEYS, type ConfigEntry, type ConfigForm } from "./configurationShared";

export function TierBadge({ tier }: { tier: string }) {
  const colorClass =
    tier === "*" ? "bg-gray-100 text-gray-800"
    : tier === "free" ? "bg-green-100 text-green-800"
    : tier === "max" ? "bg-blue-100 text-blue-800"
    : tier === "depleted" ? "bg-orange-100 text-orange-800"
    : "bg-purple-100 text-purple-800";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {tier}
    </span>
  );
}

interface ConfigFormPanelProps {
  editingEntry: { key: string; tier: string } | null;
  form: ConfigForm;
  setForm: (form: ConfigForm) => void;
  saving: boolean;
  saveError: string | null;
  onSave: () => void;
  onClose: () => void;
}

export function ConfigFormPanel({ editingEntry, form, setForm, saving, saveError, onSave, onClose }: ConfigFormPanelProps) {
  function selectWellKnownKey(key: string) {
    const known = WELL_KNOWN_KEYS.find((k) => k.key === key);
    setForm({
      ...form,
      key,
      tier: GLOBAL_ONLY_KEYS.has(key) ? "*" : form.tier,
      description: known?.description ?? form.description,
    });
  }

  return (
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
              type={SENSITIVE_KEYS.has(form.key) ? "password" : "text"}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={editingEntry && SENSITIVE_KEYS.has(form.key) ? "Leave empty to keep current value" : ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              autoComplete={SENSITIVE_KEYS.has(form.key) ? "off" : undefined}
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
      {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onClose}
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface ConfirmDeleteModalProps {
  entry: ConfigEntry;
  deleting: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ entry, deleting, deleteError, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
        <p className="mt-2 text-sm text-gray-600">
          Delete &quot;{entry.key}&quot; (tier: {entry.tier})?
        </p>
        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
