import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Bell,
  Clock,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { api } from "../api";
import { useLibrary } from "../context/LibraryContext";

const navItems = [
  { label: "Overview", icon: Home, to: "/librarian", end: true },
  { label: "Catalog & Inventory", icon: LayoutGrid, to: "/librarian/catalog" },
  { label: "Circulation Desk", icon: Clock, to: "/librarian/circulation" },
  { label: "Members", icon: Users, to: "/librarian/members" },
  { label: "Settings", icon: Settings, to: "/librarian/settings" },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-3 text-left text-[13px] transition ${
    isActive
      ? "bg-[#38D982] font-medium text-[#0D1512]"
      : "text-[#b9c8be] hover:bg-[#1a2a22]"
  }`;

const toneDot = { red: "bg-red-500", warn: "bg-[#FBBF24]", green: "bg-[#38D982]" };

function Sidebar({ onNavigate }) {
  const { user } = useLibrary();

  return (
    <div className="flex h-full w-full flex-col border-r border-[#26382f] bg-[#0f1914] px-2.5 py-4">
      <div className="mb-6 flex items-start gap-2 px-1.5">
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[#38D982]" />
        <span className="text-[13px] font-medium leading-tight text-white">
          Library Management System
        </span>
      </div>

      <nav className="flex flex-col gap-1.5">
        {navItems.map(({ label, icon: Icon, to, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-[#6b5416] bg-[#3b2f0f] py-2 text-center text-[13px] capitalize text-[#FBBF24]">
        {user.role || "librarian"} role
      </div>
    </div>
  );
}

function Topbar({ onMenu }) {
  const { user, logout } = useLibrary();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [results, setResults] = useState(null); // null = not searching
  const [notes, setNotes] = useState([]);
  const [panel, setPanel] = useState(null); // "bell" | "search" | null

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // notifications: load now, then refresh every minute
  useEffect(() => {
    let alive = true;
    const load = () =>
      api("/librarian/notifications")
        .then((d) => alive && setNotes(d.items))
        .catch(() => {});
    load();
    const timer = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  // search: wait 300ms after typing stops
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      api(`/librarian/search?q=${encodeURIComponent(term)}`)
        .then((r) => {
          setResults(r);
          setPanel("search");
        })
        .catch(() => setResults({ books: [], members: [] }));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const open = (path) => {
    navigate(path);
    setQ("");
    setResults(null);
    setPanel(null);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    if (results?.members.length && !results?.books.length) open(`/librarian/members?q=${encodeURIComponent(term)}`);
    else open(`/librarian/catalog?q=${encodeURIComponent(term)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const hasResults = results && (results.books.length > 0 || results.members.length > 0);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#26382f] bg-[#0b130f] px-5 py-3.5">
      {panel && (
        <button aria-label="Close" onClick={() => setPanel(null)} className="fixed inset-0 z-10 cursor-default" />
      )}

      <button onClick={onMenu} aria-label="Open menu" className="rounded-lg p-2 hover:bg-[#1a2a22] md:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <div className="mr-auto">
        <h1 className="text-[15px] text-white">
          {greeting}, {user.name} (Librarian)
        </h1>
        <p className="text-[13px] text-[#9bb0a4]">{today}</p>
      </div>

      {/* search */}
      <form onSubmit={submitSearch} className="relative z-20 hidden sm:block">
        <div className="flex h-10 w-[260px] items-center gap-2 rounded-lg border border-[#2a3d33] bg-[#16231c] px-3">
          <Search className="h-4 w-4 text-[#9bb0a4]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => results && setPanel("search")}
            placeholder="Search books or members"
            className="w-full bg-transparent text-[14px] text-white placeholder-[#9bb0a4] outline-none"
          />
        </div>

        {panel === "search" && results && (
          <div className="absolute right-0 top-12 w-[320px] rounded-lg border border-[#26382f] bg-[#131f19] p-2 shadow-xl">
            {!hasResults && <p className="px-2 py-3 text-[13px] text-[#9bb0a4]">No matches for "{q.trim()}".</p>}

            {results.books.length > 0 && (
              <>
                <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-[#9bb0a4]">Books</p>
                {results.books.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => open(`/librarian/catalog?q=${encodeURIComponent(b.title)}`)}
                    className="block w-full rounded-md px-2 py-2 text-left hover:bg-[#1a2a22]"
                  >
                    <p className="text-[13px] text-white">{b.title}</p>
                    <p className="text-[11px] text-[#9bb0a4]">{b.author}</p>
                  </button>
                ))}
              </>
            )}

            {results.members.length > 0 && (
              <>
                <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-[#9bb0a4]">Members</p>
                {results.members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => open(`/librarian/members?q=${encodeURIComponent(m.memberId || m.name)}`)}
                    className="block w-full rounded-md px-2 py-2 text-left hover:bg-[#1a2a22]"
                  >
                    <p className="text-[13px] text-white">{m.name}</p>
                    <p className="text-[11px] text-[#9bb0a4]">#{m.memberId}</p>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </form>

      {/* notifications */}
      <div className="relative z-20">
        <button
          onClick={() => setPanel(panel === "bell" ? null : "bell")}
          aria-label="Notifications"
          className="relative text-[#cfdcd3]"
        >
          <Bell className="h-5 w-5" />
          {notes.length > 0 && (
            <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] text-white">
              {notes.length}
            </span>
          )}
        </button>

        {panel === "bell" && (
          <div className="absolute right-0 top-9 w-[300px] rounded-lg border border-[#26382f] bg-[#131f19] p-2 shadow-xl">
            <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-[#9bb0a4]">Needs attention</p>
            {notes.length === 0 && <p className="px-2 py-3 text-[13px] text-[#9bb0a4]">You're all caught up.</p>}
            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => open(n.to)}
                className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-[13px] text-white hover:bg-[#1a2a22]"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneDot[n.tone]}`} />
                {n.text}
              </button>
            ))}
          </div>
        )}
      </div>

      <span
        title={user.email}
        className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-emerald-700 text-sm font-semibold text-[#0E1511]"
      >
        {user.name?.[0] ?? "L"}
      </span>

      <button onClick={handleLogout} aria-label="Log out" title="Log out" className="text-[#cfdcd3] hover:text-white">
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  );
}

export default function LibrarianLayout() {
  const { toast } = useLibrary();
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b130f] font-sans text-white">
      {/* desktop: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[155px] md:block">
        <Sidebar />
      </aside>

      {/* mobile: drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/60" />
          <aside className="absolute inset-y-0 left-0 w-[200px]">
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0 md:ml-[155px]">
        <Topbar onMenu={() => setDrawer(true)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 rounded-lg border border-[#38D982] bg-[#131f19] px-4 py-2.5 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}