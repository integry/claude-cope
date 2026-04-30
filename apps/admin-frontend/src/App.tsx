import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Licenses from "./pages/Licenses";
import Backlog from "./pages/Backlog";
import Configuration from "./pages/Configuration";

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

function App() {
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
