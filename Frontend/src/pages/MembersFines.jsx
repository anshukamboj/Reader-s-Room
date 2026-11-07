import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { api } from "../api";
import { useLibrary } from "../context/LibraryContext";

const tabs = ["Members", "Fines & Payments"];
const PAGE = 10;

const statusPill = {
  Active: "border-[#38D982]/70 bg-[#143824] text-[#7be8ad]",
  Suspended: "border-[#FBBF24]/70 bg-[#4a3a12] text-[#FBBF24]",
};

const money = (n) => `$${Number(n).toFixed(2)}`;
const fmtDate = (s) =>
  new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const initials = (n) =>
  n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/* ------------------------------ Helpers ----------------------------- */

function Avatar({ name, size = 36 }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-emerald-700 text-[13px] font-semibold text-[#0E1511]"
    >
      {initials(name)}
    </span>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-lg border border-[#2a3d33] bg-[#16231c] py-0 pl-3 pr-8 text-[14px] text-white outline-none focus:border-[#3b8259]"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9bb0a4]" />
    </div>
  );
}

function Accordion({ title, sub, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[#26382f] py-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between text-left">
        <div>
          <p className="text-[15px] font-medium text-white">{title}</p>
          {sub && !open && <p className="mt-1 text-[13px] text-[#9bb0a4]">{sub}</p>}
        </div>
        <ChevronDown className={`h-4 w-4 text-[#cfdcd3] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-2 space-y-1 text-[13px] text-[#cfdcd3]">{children}</div>}
    </div>
  );
}

function Pager({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const btn = "rounded-md border border-[#2a3d33] px-3 py-1 hover:bg-[#1a2a22] disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center justify-between border-t border-[#26382f] px-4 py-3 text-[13px] text-[#cfdcd3]">
      <span>Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button className={btn} disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
        <button className={btn} disabled={page === pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}

/* --------------------------- Profile drawer ------------------------- */

function ProfileDrawer({ member, details, onClose, onToggleStatus, onEdit, onSetFines }) {
  const [amount, setAmount] = useState("");

  const addFine = () => {
    const n = Number(amount);
    if (!n || n <= 0) return;
    onSetFines(Math.round((member.fines + n) * 100) / 100);
    setAmount("");
  };

  return (
    <aside className="fixed bottom-0 right-0 top-[69px] z-40 w-full max-w-[310px] overflow-y-auto border-l border-[#26382f] bg-[#0f1914] p-5 shadow-2xl">
      <div className="flex items-start justify-between">
        <p className="text-[15px] text-white">Member Profile:</p>
        <button onClick={onClose} aria-label="Close" className="text-[#cfdcd3] hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <h2 className="mt-1 text-[22px] font-semibold leading-tight text-white">{member.name}</h2>
      <p className="text-[20px] text-[#b9c8be]">(#{member.memberId})</p>

      <div className="mt-4 space-y-0.5 text-[13px]">
        <p className="text-[#cfdcd3]">{member.email}</p>
        <p className="text-[#cfdcd3]">Phone: {member.phone || "Not provided"}</p>
        <p className="pt-1 text-[#cfdcd3]">
          Membership status{" "}
          <span className={`ml-1 rounded-full border px-2 py-0.5 text-[11px] ${statusPill[member.status]}`}>
            {member.status}
          </span>
        </p>
      </div>

      <div className="mt-5">
        <Accordion title="Contact Details" sub="Email & Phone">
          <p>Email: {member.email}</p>
          <p>Phone: {member.phone || "Not provided"}</p>
        </Accordion>

        <Accordion title="Membership" sub={`Joined ${fmtDate(member.joined)} · ${member.type}`} defaultOpen>
          <p>Joined: {fmtDate(member.joined)}</p>
          <p>Membership Type: {member.type}</p>
        </Accordion>

        <Accordion title={`Active Loans (${member.loans} Books)`}>
          {!details && <p>Loading...</p>}
          {details?.loans.length === 0 && <p>No active loans.</p>}
          {details?.loans.map((l, i) => (
            <p key={i}>• {l.title} <span className="text-[#9bb0a4]">(due {fmtDate(l.due)})</span></p>
          ))}
        </Accordion>

        <Accordion title="Reservation History">
          {!details && <p>Loading...</p>}
          {details?.reservations.length === 0 && <p>No reservations.</p>}
          {details?.reservations.map((r, i) => (
            <p key={i}>• {r.title} ({r.status})</p>
          ))}
        </Accordion>

        <Accordion title={`Fines (${money(member.fines)})`}>
          <p>{member.fines > 0 ? `Outstanding balance: ${money(member.fines)}` : "No outstanding fines."}</p>
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              min="0"
              step="0.25"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="h-8 w-24 rounded-md border border-[#2a3d33] bg-[#16231c] px-2 text-[13px] text-white outline-none"
            />
            <button onClick={addFine} className="rounded-md border border-[#FBBF24] px-2.5 text-[12px] text-[#FBBF24] hover:bg-[#FBBF24]/10">
              Add fine
            </button>
            {member.fines > 0 && (
              <button onClick={() => onSetFines(0)} className="rounded-md bg-[#38D982] px-2.5 text-[12px] font-semibold text-[#0D1512] hover:brightness-110">
                Mark paid
              </button>
            )}
          </div>
        </Accordion>

        <Accordion title="Report Details">
          {!details && <p>Loading...</p>}
          {details && (
            <>
              <p>Books borrowed this year: {details.borrowedThisYear}</p>
              <p>
                Average return time:{" "}
                {details.avgReturnDays === null ? "No returns yet" : `${details.avgReturnDays} days`}
              </p>
            </>
          )}
        </Accordion>
      </div>

      <div className="border-t border-[#26382f] pt-4">
        <p className="text-[15px] font-medium text-white">Permitted Account Actions</p>
        <p className="mt-1 text-[13px] text-[#9bb0a4]">Quick action buttons</p>

        <button
          onClick={onToggleStatus}
          className="mt-3 h-10 w-full rounded-lg border border-[#FBBF24] text-[14px] text-[#FBBF24] hover:bg-[#FBBF24]/10"
        >
          {member.status === "Active" ? "Suspend Account" : "Reactivate Account"}
        </button>
        <button
          onClick={onEdit}
          className="mt-2 h-10 w-full rounded-lg border border-[#8aa396]/60 text-[14px] text-white hover:bg-white/5"
        >
          Edit Member
        </button>
      </div>
    </aside>
  );
}

/* ----------------------------- Member modal ------------------------- */

function MemberModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    type: initial?.type || "Primary",
    password: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const field =
    "h-10 w-full rounded-lg border border-[#2a3d33] bg-[#16231c] px-3 text-[14px] text-white placeholder-[#7f948a] outline-none focus:border-[#3b8259]";

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim() || !form.email.trim()) return setErr("Name and email are required.");
    if (mode === "create" && form.password.length < 8) return setErr("Password must be at least 8 characters.");
    setBusy(true);
    try {
      await onSave(form);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-xl border border-[#26382f] bg-[#131f19] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium text-white">{mode === "edit" ? "Edit Member" : "Register Member"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#cfdcd3]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {err && <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">{err}</p>}
        <input className={field} placeholder="Full name" value={form.name} onChange={set("name")} />
        <input className={field} placeholder="Email" type="email" value={form.email} onChange={set("email")} />
        <input className={field} placeholder="Phone (optional)" value={form.phone} onChange={set("phone")} />
        <select className={field} value={form.type} onChange={set("type")}>
          <option>Primary</option>
          <option>Medium</option>
          <option>Premium</option>
        </select>
        {mode === "create" && (
          <input className={field} placeholder="Temporary password (min 8 characters)" type="password" value={form.password} onChange={set("password")} />
        )}
        <button
          disabled={busy}
          className="h-10 w-full rounded-lg bg-[#38D982] text-[14px] font-semibold text-[#0D1512] hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Saving..." : mode === "edit" ? "Save changes" : "Register"}
        </button>
      </form>
    </div>
  );
}

/* -------------------------------- Page ------------------------------ */

export default function MembersFines() {
  const { notify } = useLibrary();
  const [params] = useSearchParams();

  const [tab, setTab] = useState("Members");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState(params.get("q") || "");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [modal, setModal] = useState(null); // { mode: "create" | "edit", member? }

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  const load = useCallback(async () => {
    try {
      setMembers(await api("/members"));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [q, status, type, sort, tab]);

  useEffect(() => {
    if (!selectedId) {
      setDetails(null);
      return;
    }
    let alive = true;
    setDetails(null);
    api(`/members/${selectedId}/details`)
      .then((d) => alive && setDetails(d))
      .catch(() => alive && setDetails({ loans: [], reservations: [], borrowedThisYear: 0, avgReturnDays: null }));
    return () => {
      alive = false;
    };
  }, [selectedId]);

  const selected = members.find((m) => m.id === selectedId);

  const visible = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = members.filter((m) => {
      if (s && ![m.name, m.memberId, m.email].some((x) => (x || "").toLowerCase().includes(s))) return false;
      if (status && m.status !== status) return false;
      if (type && m.type !== type) return false;
      return true;
    });
    if (sort === "Newest first") list = [...list].sort((a, b) => b.joined.localeCompare(a.joined));
    if (sort === "Oldest first") list = [...list].sort((a, b) => a.joined.localeCompare(b.joined));
    return list;
  }, [members, q, status, type, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE));
  const rows = visible.slice((page - 1) * PAGE, page * PAGE);
  const finesList = members.filter((m) => m.fines > 0);

  const chips = [
    status && { label: `Status: ${status}`, clear: () => setStatus("") },
    type && { label: `Type: ${type}`, clear: () => setType("") },
    sort && { label: `Registered: ${sort}`, clear: () => setSort("") },
  ].filter(Boolean);

  const run = async (fn, okMsg) => {
    try {
      await fn();
      await load();
      if (okMsg) notify(okMsg);
    } catch (e) {
      notify(e.message);
    }
  };

  const toggleStatus = (m) =>
    run(
      () => api(`/members/${m.id}/status`, { method: "PATCH" }),
      m.status === "Active" ? `${m.name} was suspended.` : `${m.name} was reactivated.`
    );

  const setFines = (m, amount) =>
    run(
      () => api(`/members/${m.id}/fines`, { method: "PATCH", body: { fines: amount } }),
      amount === 0 ? "Fines marked as paid." : "Fine added."
    );

  const saveMember = async (form) => {
    if (modal.mode === "edit") {
      await api(`/members/${modal.member.id}`, { method: "PUT", body: form });
    } else {
      await api("/members", { method: "POST", body: form });
    }
    await load();
    notify(modal.mode === "edit" ? "Member updated." : "Member registered.");
    setModal(null);
  };

  const cols = "grid-cols-[1.7fr_1.4fr_0.9fr_0.7fr_0.9fr_1fr_60px]";

  return (
    <>
      <div className={selected && tab === "Members" ? "xl:mr-[310px]" : ""}>
        <h1 className="text-[28px] font-semibold">Members &amp; Fines Management</h1>

        <div className="mt-4 flex gap-8 border-b border-[#26382f]">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-[3px] pb-3 text-[17px] transition ${
                tab === t
                  ? "border-[#38D982] font-medium text-[#38D982]"
                  : "border-transparent text-[#b9c8be] hover:text-white"
              }`}
            >
              {t}
              {t === "Fines & Payments" && finesList.length > 0 && (
                <span className="ml-2 rounded-md bg-[#FBBF24] px-2 py-0.5 text-[11px] font-semibold text-[#3d2f08]">
                  {finesList.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {tab === "Members" && (
          <section className="mt-5 rounded-xl border border-[#26382f] bg-[#131f19]">
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[18px]">
                  <span className="text-[26px] font-semibold">{members.length.toLocaleString()}</span>{" "}
                  <span className="text-[#cfdcd3]">Registered Members</span>
                </p>
                <button
                  onClick={() => setModal({ mode: "create" })}
                  className="flex h-10 items-center gap-2 rounded-lg bg-[#38D982] px-4 text-[14px] font-semibold text-[#0D1512] hover:brightness-110"
                >
                  <Plus className="h-4 w-4" />
                  Register Member
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#2a3d33] bg-[#16231c] px-3">
                  <Search className="h-4 w-4 text-[#9bb0a4]" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name, ID, or email..."
                    className="w-full bg-transparent text-[14px] text-white placeholder-[#7f948a] outline-none"
                  />
                </div>
                <Select label="Status" value={status} onChange={setStatus} options={["Active", "Suspended"]} />
                <Select label="Membership Type" value={type} onChange={setType} options={["Primary", "Medium", "Premium"]} />
                <Select label="Registration Date" value={sort} onChange={setSort} options={["Newest first", "Oldest first"]} />
              </div>

              {chips.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <span key={c.label} className="flex items-center gap-1.5 rounded-md border border-[#2a3d33] bg-[#16231c] px-2.5 py-1 text-[13px]">
                      {c.label}
                      <button onClick={c.clear} aria-label={`Remove ${c.label}`}>
                        <X className="h-3 w-3 text-[#9bb0a4] hover:text-white" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-x-auto border-t border-[#26382f]">
              <div className="min-w-[860px]">
                <div className={`grid ${cols} items-center gap-3 bg-[#182a21] px-4 py-3 text-[13px] text-[#e3ece6]`}>
                  <span>Member Name</span>
                  <span>Email</span>
                  <span className="leading-tight">Membership<br />Type</span>
                  <span className="leading-tight">Active<br />Loans</span>
                  <span className="leading-tight">Outstanding<br />Fines</span>
                  <span className="leading-tight">Account<br />Status</span>
                  <span>Actions</span>
                </div>

                {loading && <p className="px-4 py-8 text-sm text-[#9bb0a4]">Loading members...</p>}
                {!loading && rows.length === 0 && (
                  <p className="px-4 py-8 text-sm text-[#9bb0a4]">
                    {members.length === 0 ? "No members registered yet." : "No members match your search."}
                  </p>
                )}

                {rows.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`grid ${cols} cursor-pointer items-center gap-3 border-t border-[#26382f] px-4 py-3 text-[14px] transition hover:bg-[#182a21] ${
                      selectedId === m.id ? "bg-[#17281f]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} />
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-white">{m.name}</p>
                        <p className="text-[12px] text-[#9bb0a4]">#{m.memberId}</p>
                      </div>
                    </div>
                    <span className="truncate text-white">{m.email}</span>
                    <span>{m.type}</span>
                    <span>{m.loans}</span>
                    <span className={m.fines > 0 ? "text-[#FBBF24]" : ""}>{money(m.fines)}</span>
                    <span className={`w-fit rounded-full border px-2.5 py-0.5 text-[12px] ${statusPill[m.status]}`}>
                      {m.status}
                    </span>
                    <button className="text-left text-[#4ade80] hover:underline">View</button>
                  </div>
                ))}
              </div>
            </div>

            <Pager page={page} pages={pages} onChange={setPage} />
          </section>
        )}

        {tab === "Fines & Payments" && (
          <section className="mt-5 overflow-x-auto rounded-xl border border-[#26382f] bg-[#131f19]">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[1.6fr_1fr_1fr_120px] gap-3 bg-[#182a21] px-5 py-3 text-[13px] text-[#e3ece6]">
                <span>Member</span>
                <span>Member ID</span>
                <span>Outstanding</span>
                <span>Action</span>
              </div>
              {finesList.length === 0 && <p className="px-5 py-8 text-sm text-[#9bb0a4]">All fines are paid.</p>}
              {finesList.map((m) => (
                <div key={m.id} className="grid grid-cols-[1.6fr_1fr_1fr_120px] items-center gap-3 border-t border-[#26382f] px-5 py-3 text-[14px]">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} />
                    <span>{m.name}</span>
                  </div>
                  <span className="text-[#cfdcd3]">#{m.memberId}</span>
                  <span className="text-[#FBBF24]">{money(m.fines)}</span>
                  <button
                    onClick={() => setFines(m, 0)}
                    className="h-9 rounded-md bg-[#38D982] text-[13px] font-semibold text-[#0D1512] hover:brightness-110"
                  >
                    Mark Paid
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {selected && tab === "Members" && (
        <ProfileDrawer
          member={selected}
          details={details}
          onClose={() => setSelectedId(null)}
          onToggleStatus={() => toggleStatus(selected)}
          onEdit={() => setModal({ mode: "edit", member: selected })}
          onSetFines={(amount) => setFines(selected, amount)}
        />
      )}

      {modal && (
        <MemberModal
          mode={modal.mode}
          initial={modal.member}
          onClose={() => setModal(null)}
          onSave={saveMember}
        />
      )}
    </>
  );
}