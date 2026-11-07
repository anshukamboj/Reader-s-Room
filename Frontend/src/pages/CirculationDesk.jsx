import { useEffect, useMemo, useState } from "react";
import { ScanLine } from "lucide-react";

/* ------------------------------- Data ------------------------------- */

const members = {
  "MEM-99201": { name: "Alexander Mercer", fines: 0 },
  "MEM-99202": { name: "Jane Burtier", fines: 4.5 },
  "MEM-99203": { name: "Sanita Rao", fines: 0 },
};

const copies = {
  "LIB-00104": { title: "The Hidden Forest", author: "Marcus Author", isbn: "978-3-16-148410-0", condition: "Good" },
  "LIB-00105": { title: "Science Therapy", author: "Science", isbn: "978-3-16-148411-7", condition: "Good" },
  "LIB-00106": { title: "History of History", author: "Axther Beyar", isbn: "978-3-16-148412-4", condition: "Worn" },
};

const clean = (v) => v.trim().replace(/^#/, "").toUpperCase();
const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtLong = (d) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const addDays = (n) => new Date(Date.now() + n * 86400000);

const tabs = ["Issue Book", "Return Book", "Active Transactions"];

/* ------------------------------ Helpers ----------------------------- */

// Decorative barcode drawn from the text value
function Barcode({ value, className = "" }) {
  const bars = useMemo(() => {
    let seed = 0;
    for (const ch of value || "x") seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
    const out = [];
    let x = 0;
    for (let i = 0; i < 64; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const w = 1 + (seed % 3);
      if (i % 2 === 0) out.push({ x, w });
      x += w + 1;
    }
    return { rects: out, width: x };
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${bars.width} 40`}
      preserveAspectRatio="none"
      className={className}
      fill="currentColor"
    >
      {bars.rects.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="40" />
      ))}
    </svg>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section className={`rounded-xl border border-[#26382f] bg-[#131f19] ${className}`}>
      {children}
    </section>
  );
}

const zig = (card) =>
  `linear-gradient(135deg, ${card} 25%, transparent 25%) -6px 0/12px 12px, linear-gradient(225deg, ${card} 25%, transparent 25%) -6px 0/12px 12px, #f3f3f1`;
const zigBottom = (card) =>
  `linear-gradient(315deg, ${card} 25%, transparent 25%) -6px 0/12px 12px, linear-gradient(45deg, ${card} 25%, transparent 25%) -6px 0/12px 12px, #f3f3f1`;

/* ----------------------------- Issue book --------------------------- */

function IssueBook({ log, onIssue }) {
  const [memberId, setMemberId] = useState("MEM-99201");
  const [copyId, setCopyId] = useState("LIB-00104");
  const [msg, setMsg] = useState(null);

  const member = members[clean(memberId)];
  const copy = copies[clean(copyId)];
  const eligible = member && member.fines === 0;
  const due = addDays(30);

  const confirm = () => {
    if (!member) return setMsg({ ok: false, text: "Member not found. Check the member ID." });
    if (!eligible) return setMsg({ ok: false, text: "Member has unpaid fines and can't borrow." });
    if (!copy) return setMsg({ ok: false, text: "Book copy not found. Check the barcode." });
    if (log.some((l) => l.copyId === clean(copyId)))
      return setMsg({ ok: false, text: "This copy is already issued." });

    onIssue({
      copyId: clean(copyId),
      memberId: clean(memberId),
      title: copy.title,
      issuedAt: new Date(),
      due,
    });
    setMsg({ ok: true, text: `Issued "${copy.title}" to ${member.name}.` });
    setCopyId("");
  };

  // Enter key confirms
  useEffect(() => {
    const onKey = (e) => e.key === "Enter" && confirm();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Step 1 */}
      <Panel className="p-5">
        <h2 className="text-[22px] font-medium leading-tight text-white">
          Step 1: Scan or Enter
          <br />
          Member ID / Barcode
        </h2>

        <div className="mt-4 flex h-[72px] items-center justify-between rounded-lg border border-[#2a3d33] bg-[#16231c] px-4 text-white">
          <Barcode value={memberId} className="h-11 w-[70%]" />
          <ScanLine className="h-9 w-9 text-[#38D982]" />
        </div>
        <input
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          placeholder="Enter member ID (e.g. MEM-99201)"
          className="mt-2 h-9 w-full rounded-md border border-[#2a3d33] bg-transparent px-3 text-[13px] text-white placeholder-[#7f948a] outline-none focus:border-[#3b8259]"
        />

        <p className="mt-5 text-[16px] text-[#9bb0a4]">Active Member</p>
        {member ? (
          <>
            <h3 className="text-[22px] font-medium text-white">{member.name}</h3>
            <p className="text-[16px] text-[#b9c8be]">(#{clean(memberId)})</p>
            <span
              className={`mt-3 inline-block rounded-full px-4 py-1.5 text-[15px] font-medium ${
                eligible ? "bg-[#38D982] text-[#0D1512]" : "bg-red-500/80 text-white"
              }`}
            >
              {eligible ? "Eligible for Borrowing" : "Not Eligible"}
            </span>
            <p className="mt-4 text-[16px] text-[#9bb0a4]">Status</p>
            <p className="text-[18px] text-white">
              {member.fines === 0 ? "0 Fines" : `$${member.fines.toFixed(2)} in fines`}
            </p>
          </>
        ) : (
          <p className="mt-2 text-[15px] text-red-400">No member found for this ID.</p>
        )}
      </Panel>

      {/* Step 2 */}
      <Panel className="p-5">
        <h2 className="text-[22px] font-medium leading-tight text-white">
          Step 2: Scan or Enter Book
          <br />
          Copy Barcode
        </h2>

        <div className="mt-4 flex h-[72px] items-center rounded-lg border border-[#2a3d33] bg-[#16231c] px-4 text-white">
          <Barcode value={copyId} className="h-11 w-[70%]" />
        </div>
        <input
          value={copyId}
          onChange={(e) => setCopyId(e.target.value)}
          placeholder="Enter copy barcode (e.g. LIB-00104)"
          className="mt-2 h-9 w-full rounded-md border border-[#2a3d33] bg-transparent px-3 text-[13px] text-white placeholder-[#7f948a] outline-none focus:border-[#3b8259]"
        />

        <p className="mt-5 text-[16px] text-[#9bb0a4]">Scanned Book</p>
        {copy ? (
          <>
            <h3 className="text-[22px] font-medium text-white">{copy.title}</h3>
            <p className="text-[16px] text-[#b9c8be]">(#{clean(copyId)})</p>
            <div className="mt-2 space-y-1 text-[16px]">
              <p className="text-[#b9c8be]">Author: <span className="text-white">{copy.author}</span></p>
              <p className="text-[#b9c8be]">ISBN: <span className="text-white">{copy.isbn}</span></p>
              <p className="text-[#b9c8be]">Copy Condition: <span className="text-white">{copy.condition}</span></p>
              <p className="text-[#b9c8be]">Due Date: <span className="text-white">{fmt(due)} (30 Days)</span></p>
            </div>
          </>
        ) : (
          <p className="mt-2 text-[15px] text-[#9bb0a4]">Scan or type a copy barcode to see the book.</p>
        )}
      </Panel>

      {/* Circulation log */}
      <CirculationLog log={log} className="lg:row-span-2" />

      {/* Confirm */}
      <Panel className="p-5 lg:col-span-2">
        {msg && (
          <p className={`mb-3 text-[14px] ${msg.ok ? "text-[#38D982]" : "text-red-400"}`} role="status">
            {msg.text}
          </p>
        )}
        <button
          onClick={confirm}
          className="h-12 w-full rounded-lg bg-[#38D982] text-[17px] font-semibold text-[#0D1512] hover:brightness-110"
        >
          Confirm Issue (Enter ↵)
        </button>
        <p className="mt-3 text-[14px] text-[#cfdcd3]">
          Checkout in: Max 30-day loan period, late fees apply if returned overdue.
        </p>
        <p className="text-[14px] text-[#9bb0a4]">
          Checkout transaction policy: Overdue transactions may be returned late with fees.
        </p>
      </Panel>
    </div>
  );
}

/* --------------------------- Circulation log ------------------------ */

function CirculationLog({ log, className = "" }) {
  return (
    <Panel className={`overflow-hidden p-5 ${className}`}>
      <h2 className="text-[22px] font-medium text-white">Circulation Log</h2>

      <div className="mt-4 max-h-[520px] space-y-0 overflow-y-auto">
        {log.length === 0 && <p className="text-[14px] text-[#9bb0a4]">No transactions yet.</p>}

        {log.map((l, i) => (
          <div key={l.copyId + i} className="text-[#1b1f1d]">
            <div className="h-3" style={{ background: zig("#131f19") }} />
            <div className="bg-[#f3f3f1] px-5 pb-4">
              <h3 className="text-right text-[26px] font-semibold leading-none">Receipt</h3>
              <p className="mt-1 text-right text-[16px]">{fmtLong(l.issuedAt)}</p>

              <p className="mt-5 text-[14px] text-[#555]">Recently issued</p>
              <p className="text-[17px] font-semibold leading-tight">{l.title}</p>
              <p className="text-[15px]">(#{l.copyId})</p>
              <p className="mt-1 text-[13px] text-[#555]">Due {fmt(l.due)}</p>

              <span className="mt-2 inline-block rounded-full bg-[#8fe3b0] px-3 py-0.5 text-[13px] font-medium">
                Status
              </span>

              {i === 0 && <Barcode value={l.copyId} className="mt-4 h-9 w-full" />}
            </div>
            <div className="h-3" style={{ background: zigBottom("#131f19") }} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ----------------------------- Return book -------------------------- */

function ReturnBook({ log, onReturn }) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const id = clean(code);
    const found = log.find((l) => l.copyId === id);
    if (!found) return setMsg({ ok: false, text: "No active loan found for this barcode." });
    onReturn(id);
    setMsg({ ok: true, text: `Returned "${found.title}". Thank you!` });
    setCode("");
  };

  return (
    <Panel className="max-w-xl p-5">
      <h2 className="text-[22px] font-medium text-white">Scan or Enter Book Copy Barcode</h2>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="flex h-[72px] items-center rounded-lg border border-[#2a3d33] bg-[#16231c] px-4 text-white">
          <Barcode value={code} className="h-11 w-[70%]" />
        </div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. LIB-00104"
          className="h-11 w-full rounded-lg border border-[#2a3d33] bg-transparent px-3 text-[15px] text-white placeholder-[#7f948a] outline-none focus:border-[#3b8259]"
        />
        {msg && <p className={`text-[14px] ${msg.ok ? "text-[#38D982]" : "text-red-400"}`}>{msg.text}</p>}
        <button className="h-12 w-full rounded-lg bg-[#38D982] text-[17px] font-semibold text-[#0D1512] hover:brightness-110">
          Confirm Return
        </button>
      </form>
    </Panel>
  );
}

/* ------------------------ Active transactions ----------------------- */

function ActiveTransactions({ log }) {
  return (
    <Panel className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 bg-[#182a21] px-5 py-3 text-[14px] text-[#e3ece6]">
          <span>Book</span>
          <span>Member</span>
          <span>Issued</span>
          <span>Due</span>
        </div>
        {log.length === 0 && <p className="px-5 py-6 text-[14px] text-[#9bb0a4]">No active transactions.</p>}
        {log.map((l, i) => (
          <div
            key={l.copyId + i}
            className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 border-t border-[#26382f] px-5 py-3 text-[14px] text-white"
          >
            <span>
              {l.title} <span className="text-[#9bb0a4]">(#{l.copyId})</span>
            </span>
            <span>{members[l.memberId]?.name ?? l.memberId}</span>
            <span>{fmt(l.issuedAt)}</span>
            <span>{fmt(l.due)}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* -------------------------------- Page ------------------------------ */

export default function CirculationDesk() {
  const [tab, setTab] = useState("Issue Book");
  const [log, setLog] = useState([
    { copyId: "LIB-00105", memberId: "MEM-99201", title: "Science Therapy", issuedAt: new Date(), due: addDays(30) },
    { copyId: "LIB-00106", memberId: "MEM-99203", title: "History of History", issuedAt: new Date(), due: addDays(30) },
  ]);

  const issue = (entry) => setLog((l) => [entry, ...l]);
  const giveBack = (id) => setLog((l) => l.filter((x) => x.copyId !== id));

  return (
    <>
      <h1 className="text-[34px] font-semibold">Circulation Desk</h1>

      <div className="mt-5 flex gap-8 overflow-x-auto border-b border-[#26382f]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-[3px] pb-3 text-[22px] transition ${
              tab === t
                ? "border-[#38D982] font-medium text-[#38D982]"
                : "border-transparent text-[#b9c8be] hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Issue Book" && <IssueBook log={log} onIssue={issue} />}
        {tab === "Return Book" && <ReturnBook log={log} onReturn={giveBack} />}
        {tab === "Active Transactions" && <ActiveTransactions log={log} />}
      </div>
    </>
  );
}