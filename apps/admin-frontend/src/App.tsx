import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Licenses from "./pages/Licenses";
import Backlog from "./pages/Backlog";
import Configuration from "./pages/Configuration";
import {
  AdminApiProvider,
  useAdminAuth,
} from "./hooks/useAdminApi";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/users", label: "Users" },
  { to: "/licenses", label: "Licenses" },
  { to: "/backlog", label: "Backlog" },
  { to: "/configuration", label: "Configuration" },
];

function Layout({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  return (
    <div className="flex h-screen">
      <nav className="w-56 shrink-0 bg-gray-900 text-gray-100 flex flex-col">
        <div className="px-4 py-5 text-lg font-semibold tracking-wide">
          Admin Panel
        </div>
        <ul className="flex-1 space-y-1 px-2">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-800 p-2">
          <button
            onClick={onLogout}
            className="block w-full rounded px-3 py-2 text-left text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
}

function AuthPrompt({ error, serverError, onSubmit }: { error: boolean; serverError: string | null; onSubmit: (key: string) => void }) {
  const [key, setKey] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (key.trim()) onSubmit(key.trim());
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Admin Authentication</h2>
        <p className="mt-2 text-sm text-gray-600">Enter the admin API key to access the panel.</p>
        <p className="mt-2 text-sm text-amber-700">
          The key is kept only for this tab session. Because browser-stored bearer tokens can be read by injected scripts, deploy this admin UI only on a trusted internal origin.
        </p>
        {error && <p className="mt-2 text-sm text-red-600">Invalid API key. Please try again.</p>}
        {serverError && <p className="mt-2 text-sm text-red-600">{serverError}</p>}
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="API Key"
          className="mt-4 block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

function AppShell() {
  const { authRequired, authError, serverError, signIn, signOut } = useAdminAuth();

  if (authRequired) {
    return (
      <AuthPrompt
        error={authError}
        serverError={serverError}
        onSubmit={signIn}
      />
    );
  }

  return (
    <BrowserRouter>
      <Layout onLogout={signOut}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/backlog" element={<Backlog />} />
          <Route path="/configuration" element={<Configuration />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AdminApiProvider>
      <AppShell />
    </AdminApiProvider>
  );
}

export default App;
