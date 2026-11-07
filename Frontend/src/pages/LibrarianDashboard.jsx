import { useEffect, useState } from "react";
import { api } from "../api.js";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  LayoutGrid,
  Moon,
  Plus,
  Repeat,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Users,
  CalendarDays,
  Receipt,
  BarChart3,
  RefreshCw,
  Clock,
} from "lucide-react";


function useDashboardData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/librarian/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, error, loading };
}

/* ------------------------------- Static ------------------------------ */

const navItems = [
  { label: "Overview", icon: Home },
  { label: "Catalog & Inventory", icon: LayoutGrid },
  { label: "Circulation Desk", icon: Clock },
  { label: "Members", icon: Users },
  { label: "Reservations", icon: CalendarDays },
  { label: "Fines", icon: Receipt },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const statDefs = [
  { key: "totalTitles", label: "Total Titles" },
  { key: "physicalCopies", label: "Physical Copies" },
  { key: "activeLoans", label: "Active Loans" },
  { key: "members", label: "Members" },
  { key: "overdueLoans", label: "Overdue Loans", warn: true },
  { key: "pendingReservations", label: "Pending Reservations" },
];

const quickActions = [
  { label: "Add Book", icon: Plus },
  { label: "Register Member", icon: Plus },
  { label: "Issue Book", icon: Repeat },
  { label: "Receive Return", icon: RefreshCw },
];

/* ------------------------------ Helpers ------------------------------ */

const fallbackAvatar = (name = "") =>
  `https://ui-avatars.com/api/?background=16231c&color=38d982&name=${encodeURIComponent(name)}`;

function Avatar({ src, name, size = 28 }) {
  return (
    <img
      src={src || fallbackAvatar(name)}
      alt=""
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover"
    />
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-[#26382f] bg-[#131f19] ${className}`}>
      {title && (
        <h2 className="border-b border-[#26382f] px-4 py-3 text-[15px] font-medium text-white">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

const actionColor = (a) => (a === "Mark Lost" ? "text-[#f87171]" : "text-[#4ade80]");
const daysColor = (d) => (d >= 17 ? "text-[#f87171]" : d >= 8 ? "text-[#fb923c]" : "text-[#f87171]");
const fmt = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : n ?? "—");
const todayLabel = () =>
  new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

/* ------------------------------- Chart ------------------------------- */

function smooth(pts) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

function ActivityChart({ days, borrowSeries, returnSeries }) {
  if (!days?.length || days.length < 2) {
    return <p className="px-2 py-8 text-center text-[12px] text-[#9bb0a4]">No activity data</p>;
  }

  const W = 300, H = 170, padL = 30, padR = 8, padT = 8, padB = 22;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const peak = Math.max(...borrowSeries, ...returnSeries, 0);
  const max = Math.max(250, Math.ceil(peak / 50) * 50);
  const ticks = Array.from({ length: 6 }, (_, i) => Math.round((max / 5) * i));

  const toPts = (arr) =>
    arr.map((v, i) => ({
      x: padL + (i * iw) / (arr.length - 1),
      y: padT + ih - (v / max) * ih,
    }));

  const b = toPts(borrowSeries);
  const r = toPts(returnSeries);
  const baseY = padT + ih;
  const area = (pts) => `${smooth(pts)} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="gBorrow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38D982" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#38D982" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="gReturn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e4b62f" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e4b62f" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = padT + ih - (t / max) * ih;
        return (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#26382f" strokeWidth="0.6" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="8" fill="#9bb0a4">
              {t}
            </text>
          </g>
        );
      })}

      <path d={area(b)} fill="url(#gBorrow)" />
      <path d={smooth(b)} fill="none" stroke="#38D982" strokeWidth="1.8" />
      <path d={area(r)} fill="url(#gReturn)" />
      <path d={smooth(r)} fill="none" stroke="#e4b62f" strokeWidth="1.8" />

      {days.map((d, i) => (
        <text key={`${d}-${i}`} x={b[i].x} y={H - 6} textAnchor="middle" fontSize="8" fill="#9bb0a4">
          {d}
        </text>
      ))}
    </svg>
  );
}

/* ------------------------------ Sidebar ------------------------------ */

function Sidebar({ role }) {
  const [active, setActive] = useState("Overview");
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[145px] flex-col border-r border-[#26382f] bg-[#0f1914] px-2 py-4 md:flex">
      <div className="mb-5 flex items-center gap-2 px-2">
        <BookOpen className="h-6 w-6 text-[#38D982]" />
        <span className="text-[18px] font-medium text-white">Reader's Room</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
              active === label
                ? "bg-[#38D982] font-medium text-[#0D1512]"
                : "text-[#b9c8be] hover:bg-[#1a2a22]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="mb-4 rounded-lg border border-[#6b5416] bg-[#3b2f0f] py-2 text-center text-[13px] text-[#FBBF24]">
          {role || "Admin"} Role
        </div>
        <div className="flex items-center gap-2 border-t border-[#26382f] px-2 pt-3">
          <BookOpen className="h-5 w-5 text-[#38D982]" />
          <span className="text-[15px] text-white">Reader's Room</span>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------- Topbar ------------------------------ */

function Topbar({ user, today, notifications }) {
  const [dark, setDark] = useState(true);
  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-[#26382f] px-5 py-3">
      <div className="mr-auto">
        <h1 className="text-[20px] font-medium text-white">
          {greeting()}, {user?.name || "—"}{" "}
          <span className="text-[#38D982]">({user?.role || "Librarian"})</span>
        </h1>
        <p className="text-[12px] text-[#9bb0a4]">{today || todayLabel()}</p>
      </div>

      <div className="flex h-9 w-[210px] items-center gap-2 rounded-lg border border-[#26382f] bg-[#16231c] px-3">
        <Search className="h-4 w-4 text-[#9bb0a4]" />
        <input
          placeholder="Search"
          className="w-full bg-transparent text-[13px] text-white placeholder-[#7f948a] outline-none"
        />
      </div>

      <button className="relative text-[#cfdcd3]">
        <Bell className="h-5 w-5" />
        {notifications > 0 && (
          <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] text-white">
            {notifications}
          </span>
        )}
      </button>

      <button className="flex h-9 items-center gap-2 rounded-lg border border-[#26382f] bg-[#16231c] px-3 text-[13px] text-white">
        Quick-access help <ChevronDown className="h-3.5 w-3.5" />
      </button>

      <button className="flex items-center gap-1">
        <Avatar src={user?.avatar} name={user?.name} size={32} />
        <ChevronDown className="h-4 w-4 text-[#cfdcd3]" />
      </button>

      <button
        onClick={() => setDark((d) => !d)}
        aria-label="Toggle theme"
        className="flex h-6 w-12 items-center rounded-full border border-[#26382f] bg-[#16231c] px-0.5"
      >
        <span
          className={`grid h-5 w-5 place-items-center rounded-full bg-[#38D982] transition-all ${
            dark ? "ml-auto" : ""
          }`}
        >
          <Moon className="h-3 w-3 text-[#0D1512]" />
        </span>
      </button>
    </header>
  );
}

/* ------------------------------ Stat cards --------------------------- */

function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {statDefs.map((s) => (
        <div
          key={s.key}
          className={`rounded-xl border p-3.5 ${
            s.warn
              ? "border-[#FBBF24] bg-gradient-to-br from-[#7a5d1a] to-[#4f3c10]"
              : "border-[#26382f] bg-[#131f19]"
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[13px] text-white">{s.label}</span>
            {s.warn && <AlertTriangle className="h-4 w-4 text-[#FBBF24]" />}
          </div>
          <div className="mt-2 text-[30px] font-medium leading-none text-white">
            {fmt(stats?.[s.key])}
          </div>
          <button
            className={`mt-3 flex w-full items-center justify-between text-[11px] ${
              s.warn ? "text-[#f1d98a]" : "text-[#4ade80]"
            }`}
          >
            Filter / Details <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- Quick actions ------------------------- */

function QuickActions() {
  return (
    <Panel>
      <div className="p-4">
        <h2 className="mb-3 text-[15px] font-medium text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex h-9 items-center justify-center gap-2 rounded-md bg-[#38D982] text-[14px] font-semibold text-[#0D1512] hover:brightness-110"
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------ Overdue table ------------------------ */

function OverdueLoans({ overdue }) {
  return (
    <Panel title="Overdue Loans & Alerts">
      <div className="grid grid-cols-[1.2fr_1.2fr_0.7fr_0.6fr_0.9fr] gap-2 bg-[#182a21] px-3 py-2 text-[11px] text-[#cfdcd3]">
        <span>Member</span>
        <span>Book Title</span>
        <span>Due Date</span>
        <span>Days Overdue</span>
        <span>Action</span>
      </div>

      {overdue.length === 0 && (
        <p className="border-t border-[#26382f] px-3 py-4 text-[11px] text-[#9bb0a4]">No overdue loans</p>
      )}

      {overdue.map((r, i) => (
        <div
          key={r.id ?? i}
          className="grid grid-cols-[1.2fr_1.2fr_0.7fr_0.6fr_0.9fr] items-center gap-2 border-t border-[#26382f] px-3 py-2 text-[11px]"
        >
          <div className="flex items-center gap-2">
            <Avatar src={r.avatar} name={r.name} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-white">{r.name}</p>
              <p className="text-[10px] text-[#9bb0a4]">Name</p>
            </div>
          </div>
          <span className="text-white">{r.book}</span>
          <span className="text-white">{r.due}</span>
          <span className={`pl-3 ${daysColor(r.days)}`}>{r.days}</span>
          <button className={`text-left ${actionColor(r.action)} hover:underline`}>
            {r.action}
          </button>
        </div>
      ))}
    </Panel>
  );
}

/* --------------------------- Circulation desk ------------------------ */

function Circulation({ activity, transactions }) {
  return (
    <Panel title="Circulation Desk & Transactions">
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <h3 className="text-[14px] font-medium text-white">Borrowing vs. Return Activity</h3>
        <button className="flex items-center gap-1 text-[12px] text-[#b9c8be]">
          Weekly <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="px-3 pb-3">
        <ActivityChart
          days={activity?.days || []}
          borrowSeries={activity?.borrow || []}
          returnSeries={activity?.return || []}
        />
      </div>

      <h3 className="border-t border-[#26382f] px-4 pb-2 pt-3 text-[14px] font-medium text-white">
        Recent Transactions
      </h3>
      <div className="grid grid-cols-[1.5fr_0.7fr_1fr_20px] gap-2 bg-[#182a21] px-4 py-2 text-[11px] text-[#cfdcd3]">
        <span>Member</span>
        <span>Due Date</span>
        <span>Status</span>
        <span />
      </div>
      {transactions.map((t, i) => (
        <div
          key={t.id ?? i}
          className="grid grid-cols-[1.5fr_0.7fr_1fr_20px] items-center gap-2 border-t border-[#26382f] px-4 py-2 text-[11px]"
        >
          <div className="flex items-center gap-2">
            <Avatar src={t.avatar} name={t.name} />
            <div className="leading-tight">
              <p className="text-white">{t.name}</p>
              <p className="text-[10px] text-[#9bb0a4]">{t.note}</p>
            </div>
          </div>
          <span className="text-white">{t.date}</span>
          <span
            className={`w-fit rounded-full border px-2.5 py-0.5 text-[10px] ${
              t.status === "Returned"
                ? "border-[#38D982]/60 bg-[#143824] text-[#7be8ad]"
                : "border-[#38D982] bg-[#1c5a38] text-white"
            }`}
          >
            {t.status}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[#9bb0a4]" />
        </div>
      ))}
    </Panel>
  );
}

/* --------------------------- Reservations panel ---------------------- */

function ReservationsPanel({ reservations }) {
  const first = reservations.find((r) => r.kind === "first");
  const rest = reservations.filter((r) => r !== first);
  const fm = first?.members?.[0];

  return (
    <Panel title="Reservations Awaiting Processing">
      <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_0.8fr] gap-2 bg-[#182a21] px-3 py-2 text-[11px] text-[#cfdcd3]">
        <span>Book Title</span>
        <span>Member</span>
        <span>Reservation Date</span>
        <span>Priority</span>
      </div>

      {reservations.length === 0 && (
        <p className="border-t border-[#26382f] px-3 py-4 text-[11px] text-[#9bb0a4]">
          No pending reservations
        </p>
      )}

      {/* first row */}
      {first && (
        <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_0.8fr] items-center gap-2 border-t border-[#26382f] px-3 py-2.5 text-[11px]">
          <div className="leading-tight">
            <p className="text-white">"{first.title}"</p>
            <p className="text-[10px] text-[#9bb0a4]">{first.sub}</p>
          </div>
          <div className="leading-tight">
            <p className="text-white">{fm?.name}</p>
            <p className="text-[10px] text-[#9bb0a4]">{fm?.role}</p>
          </div>
          <span className="text-white">{first.date}</span>
          <span className="w-fit rounded-md border border-[#FBBF24] bg-[#4a3a12] px-2 py-1 text-[10px] font-semibold text-[#FBBF24]">
            {first.badge || "#FBBF24"}
          </span>
        </div>
      )}

      {rest.map((r, i) => (
        <div key={r.id ?? i} className="border-t border-[#26382f] px-3 py-2.5">
          {r.title && <p className="mb-1.5 text-[12px] text-white">{r.title}</p>}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              {(r.members || []).map((m, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Avatar src={m.avatar} name={m.name} size={26} />
                  <div className="leading-tight">
                    <p className="text-[11px] text-white">{m.name}</p>
                    {m.role && <p className="text-[10px] text-[#9bb0a4]">{m.role}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-white">
              Priority
              <p className="text-[#FBBF24]">{r.priority}</p>
            </div>

            <div className="flex w-[84px] flex-col gap-1.5">
              <button className="rounded-md bg-[#38D982] py-1 text-[11px] font-semibold text-[#0D1512] hover:brightness-110">
                Held for Pickup
              </button>
              <button className="rounded-md border border-[#8aa396]/60 py-1 text-[11px] text-white hover:bg-white/5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ))}
    </Panel>
  );
}

/* ------------------------------ Low stock ---------------------------- */

function LowStock({ lowStock }) {
  return (
    <Panel title="Low-Stock / Missing Alert" className="relative">
      <div className="p-4 pt-3">
        {lowStock ? (
          <>
            <p className="text-[13px] text-white">
              Only {lowStock.copies} {lowStock.copies === 1 ? "copy" : "copies"} left of "{lowStock.title}"
            </p>
            <div className="mt-3 border-l-4 border-[#FBBF24] bg-[#4a3a12] px-3 py-2.5 text-[14px] text-white">
              "{lowStock.title}"
            </div>
          </>
        ) : (
          <p className="text-[13px] text-[#9bb0a4]">No low-stock alerts</p>
        )}
      </div>
      <Sparkles className="absolute bottom-3 right-4 h-9 w-9 text-white/15" />
    </Panel>
  );
}

/* --------------------------------- Page ------------------------------ */

export default function LibrarianDashboard() {
  const { data, error, loading } = useDashboardData();

  if (loading) {
    return <div className="p-6 text-[13px] text-[#9bb0a4]">Loading dashboard…</div>;
  }

  if (error || !data) {
    return (
      <div className="p-6 text-[13px] text-[#f87171]">
        Could not load dashboard data{error ? `: ${error}` : ""}.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatCards stats={data.stats} />
      <QuickActions />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.1fr_1fr_0.9fr]">
        <OverdueLoans overdue={data.overdue || []} />
        <Circulation activity={data.activity} transactions={data.transactions || []} />
        <div className="space-y-4">
          <ReservationsPanel reservations={data.reservations || []} />
          <LowStock lowStock={data.lowStock} />
        </div>
      </div>
    </div>
  );
}

/* Use these in your layout with the same fetched data:
   <Sidebar role={data.user.role} />
   <Topbar user={data.user} today={data.today} notifications={data.stats.overdueLoans} />
*/
export { Sidebar, Topbar };