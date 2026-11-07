import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Menu, Moon, Search, Sun } from "lucide-react";
import Sidebar from "./Sidebar";
import { useLibrary } from "../context/LibraryContext";

function Topbar({ onMenu }) {
  const { user, dark, setTheme, alerts, logout } = useLibrary();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [panel, setPanel] = useState(null); // "bell" | "user" | null

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const search = (e) => {
    e.preventDefault();
    navigate(`/dashboard/browse-books${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  const handleLogout = () => {
    logout();
    setPanel(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b line bg-app px-4 sm:px-6">
      <button onClick={onMenu} aria-label="Open menu" className="rounded-lg p-2 hover-bg md:hidden">
        <Menu size={20} />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold sm:text-lg">{greeting}, {user.name}</h1>
        <p className="text-xs muted">{today}</p>
      </div>

      <form onSubmit={search} className="ml-auto hidden h-10 w-56 items-center gap-2 rounded-lg border line bg-field px-3 sm:flex lg:w-72">
        <Search size={16} className="muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for category..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#7D867E]"
        />
      </form>

      <div className="ml-auto flex items-center gap-1 sm:ml-0 sm:gap-2">
        {panel && <button aria-label="Close" onClick={() => setPanel(null)} className="fixed inset-0 z-10 cursor-default" />}

        {/* notifications */}
        <div className="relative">
          <button onClick={() => setPanel(panel === "bell" ? null : "bell")} aria-label="Notifications" className="relative rounded-lg p-2 hover-bg">
            <Bell size={20} />
            {alerts.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
          </button>
          {panel === "bell" && (
            <div className="absolute right-0 top-11 z-20 w-72 rounded-lg border line bg-card p-2 shadow-lg">
              <p className="px-2 py-1 text-xs muted">Notifications</p>
              {alerts.length === 0 && <p className="px-2 py-3 text-sm muted">You're all caught up.</p>}
              {alerts.map((a) => (
                <Link key={a.id} to={a.to} onClick={() => setPanel(null)} className="block rounded-md px-2 py-2 text-sm hover-bg">
                  {a.text}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* profile */}
        <div className="relative">
          <button onClick={() => setPanel(panel === "user" ? null : "user")} className="flex items-center gap-1 rounded-lg p-1.5 hover-bg">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-emerald-700 text-sm font-semibold text-[#0E1511]">
              {user.name?.[0] ?? "U"}
            </span>
            <ChevronDown size={14} />
          </button>
          {panel === "user" && (
            <div className="absolute right-0 top-12 z-20 w-56 rounded-lg border line bg-card p-2 shadow-lg">
              <div className="border-b line px-2 pb-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs muted">{user.email}</p>
              </div>
              <Link to="/dashboard/settings" onClick={() => setPanel(null)} className="mt-1 block rounded-md px-2 py-2 text-sm hover-bg">Profile & settings</Link>
              <button onClick={handleLogout} className="block w-full rounded-md px-2 py-2 text-left text-sm hover-bg">Log out</button>
            </div>
          )}
        </div>

        <button onClick={() => setTheme(!dark)} aria-label="Toggle theme" className="rounded-lg p-2 hover-bg">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const { dark, toast } = useLibrary();
  const [drawer, setDrawer] = useState(false);

  return (
   <div
  className={`app-theme min-h-screen ${dark ? "" : "light"}`}
  style={{ backgroundColor: dark ? "#0E1511" : "#F4F6F4", color: dark ? "#E8EDE9" : "#111111" }}
>
      {/* desktop: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[175px] md:block">
        <Sidebar />
      </aside>

      {/* mobile: drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/60" />
          <aside className="absolute inset-y-0 left-0 w-[220px]">
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="min-h-screen min-w-0 md:ml-[175px]">
        <Topbar onMenu={() => setDrawer(true)} />
        <main className="mx-auto w-full min-w-0 max-w-[1400px] p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 rounded-lg border border-[#48C77D] bg-card px-4 py-2.5 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}