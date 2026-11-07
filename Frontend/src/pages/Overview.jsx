import { Link } from "react-router-dom";
import { AlertTriangle, Sparkles, Star } from "lucide-react";
import {
  useLibrary,
  books,
  bookById,
  daysLeft,
  loanDays,
  loanProgress,
  loanStatus,
  ord,
} from "../context/LibraryContext";

const pill = {
  green: "bg-[#1f6b3f] text-[#b8f0cf]",
  warn: "bg-[#6b4f12] text-[#fbbf24]",
  red: "bg-red-900/60 text-red-300",
};

/* ------------------------------ Helpers ----------------------------- */

function Cover({ book, className = "h-[88px] w-[62px]" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-center shadow-md ${book.cover} ${className}`}
    >
      <span className="px-1 text-[9px] font-bold uppercase tracking-widest text-white/90">{book.sub}</span>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-xl border line bg-card p-5 ${className}`}>
      <h2 className="mb-4 border-b line pb-3 text-[17px] font-medium">{title}</h2>
      {children}
    </section>
  );
}

function ProgressBar({ percent }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-field">
      <div className="h-full rounded-full bg-[#3fbf6f]" style={{ width: `${percent}%` }} />
    </div>
  );
}

// books borrowed per month for the last 6 months
function monthlyCounts(records) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      key: d.getFullYear() * 12 + d.getMonth(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      value: 0,
    };
  });
  records.forEach((r) => {
    const d = new Date(r.borrowedAt);
    const m = months.find((x) => x.key === d.getFullYear() * 12 + d.getMonth());
    if (m) m.value += 1;
  });
  return months;
}

/* ------------------------------- Chart ------------------------------ */

function BorrowingChart({ data }) {
  const W = 270, H = 130, padL = 26, padB = 22, padT = 8, padR = 6;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const step = Math.max(1, Math.ceil(Math.max(...data.map((d) => d.value)) / 4));
  const max = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);

  const pts = data.map((d, i) => ({
    x: padL + (i * innerW) / (data.length - 1),
    y: padT + innerH - (d.value / max) * innerH,
  }));

  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    line += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const area = `${line} L ${pts[pts.length - 1].x} ${padT + innerH} L ${pts[0].x} ${padT + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3fbf6f" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3fbf6f" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = padT + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#2a3d33" strokeWidth="0.6" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="8" fill="#9bb0a4">
              {t}
            </text>
          </g>
        );
      })}

      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.2" fill="#4ade80" />
      ))}
      {data.map((d, i) => (
        <text key={d.month + i} x={pts[i].x} y={H - 6} textAnchor="middle" fontSize="8" fill="#9bb0a4">
          {d.month}
        </text>
      ))}
    </svg>
  );
}

/* ----------------------------- Stat cards --------------------------- */

function StatCards({ loans, reservations }) {
  const dueSoon = loans.filter((l) => {
    const d = daysLeft(l.due);
    return d >= 0 && d <= 3;
  }).length;
  const overdue = loans.filter((l) => daysLeft(l.due) < 0).length;

  const stats = [
    { label: "Currently Borrowed", value: loans.length },
    { label: "Active Reservations", value: reservations.length },
    { label: "Due Soon", value: dueSoon, highlight: dueSoon > 0 },
    { label: "Overdue Books", value: overdue, danger: overdue > 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-xl border p-4 ${
            s.highlight
              ? "border-[#FBBF24] bg-gradient-to-br from-[#8a6a1f] to-[#6e5416] text-white"
              : s.danger
              ? "border-red-500/70 bg-red-900/30"
              : "line bg-card"
          }`}
        >
          <span className="text-[15px]">{s.label}</span>
          <div className="mt-3 text-[34px] leading-none">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------- Currently borrowed ---------------------- */

function CurrentlyBorrowed({ loans, renew }) {
  const soon = loans
    .filter((l) => daysLeft(l.due) <= 3)
    .sort((a, b) => daysLeft(a.due) - daysLeft(b.due));

  return (
    <Card title="Currently Borrowed">
      {loans.length === 0 && (
        <p className="text-sm muted">
          You have no borrowed books.{" "}
          <Link to="/dashboard/browse-books" className="text-[#4ade80] hover:underline">
            Browse books
          </Link>
        </p>
      )}

      <div className="space-y-4">
        {loans.map((l) => {
          const book = bookById(l.bookId);
          if (!book) return null;
          const st = loanStatus(l.due);
          const limit = l.renewals >= 2;

          return (
            <div key={l.bookId}>
              <div className="flex gap-3">
                <Cover book={book} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-medium">{book.title}</h3>
                  <p className="text-[12px] muted">By {book.author}</p>

                  <div className="mt-1 flex items-center justify-between text-[12px]">
                    <span className="muted">Loan Duration</span>
                    <span>{loanDays(l)} days</span>
                  </div>
                  <div className="mt-1">
                    <ProgressBar percent={loanProgress(l)} />
                  </div>
                  <span className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-[11px] ${pill[st.tone]}`}>
                    {st.label}
                  </span>
                </div>
              </div>

              <button
                onClick={() => renew(l.bookId)}
                disabled={limit}
                className="mt-2 w-full rounded-lg border border-[#3fbf6f] py-1.5 text-[13px] transition hover:bg-[#3fbf6f]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {limit ? "Renewal Limit Reached" : "Renew Book"}
              </button>
            </div>
          );
        })}
      </div>

      {soon.length > 0 && (
        <div className="mt-4 rounded-lg border border-[#FBBF24]/70 bg-[#4a3a12] px-3 py-2.5 text-white">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <AlertTriangle className="h-4 w-4 text-[#FBBF24]" />
            Upcoming Due Dates
          </div>
          {soon.map((l) => (
            <p key={l.bookId} className="ml-6 mt-0.5 text-[12px] text-[#f1d98a]">
              {bookById(l.bookId)?.title}: {loanStatus(l.due).label}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ---------------------------- Reservations -------------------------- */

function Reservations({ reservations, pickUp }) {
  return (
    <Card title="Reservations Queue & Updates">
      {reservations.length === 0 && <p className="text-sm muted">No active reservations.</p>}

      <div className="space-y-3">
        {reservations.map((r) => {
          const book = bookById(r.bookId);
          if (!book) return null;
          const ready = r.status === "ready";

          return (
            <div key={r.bookId} className="flex gap-3 rounded-lg border line bg-field p-2.5">
              <Cover book={book} className="h-[76px] w-[54px]" />
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-medium">{book.title}</h3>
                <p className="text-[12px] muted">By {book.author}</p>

                {ready ? (
                  <>
                    <div className="mt-1.5 rounded-md bg-[#2f7d4f] px-3 py-1.5 text-[13px] leading-snug text-white">
                      Ready for Pickup at Shelf {book.shelf}
                    </div>
                    <button
                      onClick={() => pickUp(r.bookId)}
                      className="mt-2 rounded-md border border-[#3fbf6f] px-3 py-1 text-[12px] hover:bg-[#3fbf6f]/10"
                    >
                      Borrow Now
                    </button>
                  </>
                ) : (
                  <p className="mt-1.5 text-[13px] muted">Status: {ord(r.position || 1)} in queue</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* --------------------------- Reading activity ----------------------- */

function ReadingActivity({ loans, history }) {
  const data = monthlyCounts([...loans, ...history]);

  // recommend available books from categories the member already reads
  const readIds = new Set([...loans, ...history].map((r) => String(r.bookId)));
  const categories = new Set([...readIds].map((id) => bookById(id)?.category).filter(Boolean));
  const loanedIds = new Set(loans.map((l) => String(l.bookId)));

  let recs = books.filter((b) => !loanedIds.has(b.id) && b.available > 0 && categories.has(b.category));
  if (recs.length < 2) {
    const extra = books
      .filter((b) => !loanedIds.has(b.id) && !recs.includes(b))
      .sort((a, b) => b.rating - a.rating);
    recs = [...recs, ...extra];
  }
  recs = recs.slice(0, 2);

  return (
    <Card title="Reading Activity" className="relative">
      <h3 className="mb-2 text-[14px]">Borrowing Activity Over Time</h3>
      <BorrowingChart data={data} />

      <h3 className="mt-5 text-[17px] font-medium">Recommended for You</h3>
      <p className="mb-3 text-[12px] muted">Based on your reading interests</p>

      {recs.length === 0 && <p className="text-sm muted">No recommendations yet.</p>}

      <div className="grid grid-cols-2 gap-3">
        {recs.map((b) => (
          <div key={b.id} className="rounded-lg border line bg-field p-2.5">
            <Cover book={b} className="mx-auto h-[78px] w-[56px]" />
            <p className="mt-2 truncate text-[13px]">{b.title}</p>
            <p className="truncate text-[11px] muted">By {b.author}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] muted">
              <Star className="h-3 w-3 fill-[#FBBF24] text-[#FBBF24]" />
              {b.rating}
            </p>
            <Link to="/dashboard/browse-books" className="mt-0.5 inline-block text-[12px] text-[#4ade80] hover:underline">
              View Book
            </Link>
          </div>
        ))}
      </div>

      <Sparkles className="pointer-events-none absolute bottom-3 right-3 h-9 w-9 opacity-20" />
    </Card>
  );
}

/* -------------------------------- Page ------------------------------ */

export default function Overview() {
  const { loans, reservations, history, renew, pickUp } = useLibrary();

  return (
    <div className="space-y-5">
      <StatCards loans={loans} reservations={reservations} />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_1.1fr_1fr]">
        <CurrentlyBorrowed loans={loans} renew={renew} />
        <Reservations reservations={reservations} pickUp={pickUp} />
        <ReadingActivity loans={loans} history={history} />
      </div>
    </div>
  );
}