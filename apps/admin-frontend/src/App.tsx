import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Licenses from "./pages/Licenses";
import Backlog from "./pages/Backlog";
import Configuration from "./pages/Configuration";
import {
  setAuthRequiredCallback,
  setServerMisconfiguredCallback,
  setAdminApiKey,
  getAdminApiKey,
  hasStoredApiKey,
  clearAdminApiKey,
} from "./hooks/useAdminApi";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/users", label: "Users" },
  { to: "/licenses", label: "Licenses" },
  { to: "/backlog", label: "Backlog" },
  { to: "/configuration", label: "Configuration" },
];

function Layout({ children }: { children: React.ReactNode }) {
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

function App() {
  const [authRequired, setAuthRequired] = useState(!hasStoredApiKey());
  const [authError, setAuthError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setAuthRequiredCallback(() => {
      setAuthError(!!getAdminApiKey());
      setServerError(null);
      clearAdminApiKey();
      setAuthRequired(true);
    });
    setServerMisconfiguredCallback((message) => {
      setAuthError(false);
      setServerError(message);
      clearAdminApiKey();
      setAuthRequired(true);
    });
    return () => {
      setAuthRequiredCallback(null);
      setServerMisconfiguredCallback(null);
    };
  }, []);

  if (authRequired) {
    return (
      <AuthPrompt
        error={authError}
        serverError={serverError}
        onSubmit={(key) => {
          setAdminApiKey(key);
          setAuthRequired(false);
          setAuthError(false);
          setServerError(null);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <Layout>
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

export default App;
