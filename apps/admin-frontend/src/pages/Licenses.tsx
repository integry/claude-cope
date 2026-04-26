import { useAdminApi } from "../hooks/useAdminApi";

interface License {
  id: string;
  key_hash: string;
  status: string;
  activated_at: string;
  username: string | null;
}

export default function Licenses() {
  const { data, isLoading, isError } = useAdminApi<License[]>("/api/licenses");

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

  const licenses = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Licenses</h1>
        <p className="text-sm text-gray-500">{licenses.length} license{licenses.length !== 1 ? "s" : ""} total</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Key Hash</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Activated</th>
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
                  {license.activated_at}
                </td>
              </tr>
            ))}
            {licenses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                  No licenses activated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
