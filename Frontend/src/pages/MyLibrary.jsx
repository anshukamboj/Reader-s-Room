import { useState } from "react";
import { Leaf } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import { bookById, loanStatus, loanDays, daysLeft, fmt } from "../context/LibraryContext";

const tabs = ["Currently Borrowed", "Reservations", "Reading History", "Wishlist", "Fines & Payments"];

const pill = {
  green: "bg-[#1f6b3f] text-[#b8f0cf]",
  warn: "bg-[#6b4f12] text-[#fbbf24]",
  red: "bg-red-900/60 text-red-300",
};

function Cover({ book, className = "h-[88px] w-[62px]" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-center shadow-md ${book.cover} ${className}`}
    >
      <span className="px-1 text-[9px] font-bold uppercase tracking-widest text-white/90">
        {book.sub}
      </span>
    </div>
  );
}

/* ------------------------- Currently Borrowed ------------------------- */

function LoanRow({ loan }) {
  const { renew, returnBook } = useLibrary();
  const [open, setOpen] = useState(false);
  const book = bookById(loan.bookId);
  const st = loanStatus(loan.due);
  const limit = loan.renewals >= 2;

  return (
    <div className="border-b line p-4 last:border-b-0">
      <div className="flex items-center gap-4">
        <Cover book={book} className="h-[92px] w-[64px]" />

        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] font-medium">{book.title}</h3>
          <p className="text-[14px] muted">By {book.author}</p>
          <p className="mt-0.5 text-[14px] muted">
            Checkout/ {loanDays(loan)} days - Due {fmt(loan.due)}
          </p>
          <span className={`mt-1.5 inline-block rounded-md px-2.5 py-0.5 text-[12px] ${pill[st.tone]}`}>
            {st.tone === "green" ? `${st.d} Days Remaining` : st.label}
          </span>
        </div>

        <div className="flex w-[155px] shrink-0 flex-col gap-2 sm:w-[170px]">
          {limit ? (
            <button disabled className="h-10 cursor-not-allowed rounded-lg bg-field text-[13px] muted opacity-70">
              Renewal Limit Reached
            </button>
          ) : (
            <button
              onClick={() => renew(loan.bookId)}
              className="h-10 rounded-lg bg-[#38D982] text-[14px] font-semibold text-[#0D1512] hover:brightness-110"
            >
              Renew Book
            </button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="h-10 rounded-lg border border-[#8aa396]/60 text-[14px] hover-bg"
          >
            {open ? "Hide Details" : "View Details"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border line bg-field p-3 text-[13px] sm:grid-cols-4">
          <div><p className="muted">ISBN</p><p>{book.isbn}</p></div>
          <div><p className="muted">Shelf</p><p>{book.shelf}</p></div>
          <div><p className="muted">Borrowed</p><p>{fmt(loan.borrowedAt)}</p></div>
          <div className="flex items-end">
            <button
              onClick={() => returnBook(loan.bookId)}
              className="rounded-md border line px-3 py-1.5 hover-bg"
            >
              Return Book
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CurrentlyBorrowed() {
  const { loans } = useLibrary();
  const upcoming = loans
    .filter((l) => daysLeft(l.due) <= 3)
    .sort((a, b) => daysLeft(a.due) - daysLeft(b.due));

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_270px]">
      <section className="rounded-xl border line bg-card">
        {loans.length === 0 && (
          <p className="p-6 text-sm muted">You have no borrowed books right now.</p>
        )}
        {loans.map((l) => (
          <LoanRow key={l.bookId} loan={l} />
        ))}
      </section>

      <section className="rounded-xl border line bg-card p-5">
        <h2 className="border-b line pb-3 text-[17px] font-medium">Upcoming Returns</h2>
        {upcoming.length === 0 && <p className="mt-3 text-sm muted">Nothing due soon.</p>}
        {upcoming.map((l) => {
          const st = loanStatus(l.due);
          return (
            <div key={l.bookId} className="mt-3 flex gap-2 text-[14px]">
              <span className={st.tone === "red" ? "text-red-400" : "text-[#FBBF24]"}>⚠</span>
              <div>
                <p className={st.tone === "red" ? "text-red-400" : "text-[#FBBF24]"}>{st.label}:</p>
                <p>{bookById(l.bookId).title}</p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

/* ----------------------------- Reservations ---------------------------- */

function ReservationsTab() {
  const { reservations, pickUp, cancelReservation } = useLibrary();
  return (
    <section className="rounded-xl border line bg-card">
      {reservations.length === 0 && <p className="p-6 text-sm muted">No active reservations.</p>}
      {reservations.map((r) => {
        const book = bookById(r.bookId);
        return (
          <div key={r.bookId} className="flex items-center gap-4 border-b line p-4 last:border-b-0">
            <Cover book={book} />
            <div className="min-w-0 flex-1">
              <h3 className="text-[17px] font-medium">{book.title}</h3>
              <p className="text-[14px] muted">By {book.author}</p>
              <span
                className={`mt-1.5 inline-block rounded-md px-2.5 py-0.5 text-[12px] ${
                  r.status === "ready" ? pill.green : pill.warn
                }`}
              >
                {r.status === "ready" ? `Ready for pickup at Shelf ${book.shelf}` : `Position ${r.position} in queue`}
              </span>
            </div>
            <div className="flex w-[150px] flex-col gap-2">
              {r.status === "ready" && (
                <button
                  onClick={() => pickUp(r.bookId)}
                  className="h-10 rounded-lg bg-[#38D982] text-[14px] font-semibold text-[#0D1512] hover:brightness-110"
                >
                  Borrow Now
                </button>
              )}
              <button
                onClick={() => cancelReservation(r.bookId)}
                className="h-10 rounded-lg border border-[#8aa396]/60 text-[14px] hover-bg"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* --------------------------- Reading History --------------------------- */

function HistoryTab() {
  const { history } = useLibrary();
  return (
    <section className="rounded-xl border line bg-card">
      {history.map((h, i) => {
        const book = bookById(h.bookId);
        return (
          <div key={i} className="flex items-center gap-4 border-b line p-4 last:border-b-0">
            <Cover book={book} className="h-[72px] w-[50px]" />
            <div className="min-w-0 flex-1">
              <h3 className="text-[16px] font-medium">{book.title}</h3>
              <p className="text-[13px] muted">By {book.author}</p>
            </div>
            <p className="text-right text-[13px] muted">
              {fmt(h.borrowedAt)} – {fmt(h.returnedAt)}
            </p>
          </div>
        );
      })}
    </section>
  );
}

/* ------------------------------- Wishlist ------------------------------ */

function WishlistTab() {
  const { wishlist, stock, borrow, reserve, toggleWishlist } = useLibrary();
  return (
    <section className="rounded-xl border line bg-card">
      {wishlist.length === 0 && <p className="p-6 text-sm muted">Your wishlist is empty.</p>}
      {wishlist.map((id) => {
        const book = bookById(id);
        const available = stock[id] > 0;
        return (
          <div key={id} className="flex items-center gap-4 border-b line p-4 last:border-b-0">
            <Cover book={book} />
            <div className="min-w-0 flex-1">
              <h3 className="text-[17px] font-medium">{book.title}</h3>
              <p className="text-[14px] muted">By {book.author}</p>
              <span className={`mt-1.5 inline-block rounded-md px-2.5 py-0.5 text-[12px] ${available ? pill.green : pill.warn}`}>
                {available ? `${stock[id]} available` : "Unavailable"}
              </span>
            </div>
            <div className="flex w-[150px] flex-col gap-2">
              <button
                onClick={() => (available ? borrow(id) : reserve(id))}
                className="h-10 rounded-lg bg-[#38D982] text-[14px] font-semibold text-[#0D1512] hover:brightness-110"
              >
                {available ? "Borrow" : "Reserve"}
              </button>
              <button
                onClick={() => toggleWishlist(id)}
                className="h-10 rounded-lg border border-[#8aa396]/60 text-[14px] hover-bg"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* --------------------------- Fines & Payments -------------------------- */

function FinesTab() {
  const { notify } = useLibrary();
  const [fine, setFine] = useState(2.5);
  const steps = [0, 1, 2, 3, 4];
  const active = fine > 0 ? 2 : 4;

  const pay = () => {
    setFine(0);
    notify("Payment successful. Thank you!");
  };

  return (
    <section className="max-w-md rounded-xl border line bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px]">Total Fine:</h2>
        <span className={`text-[20px] font-medium ${fine > 0 ? "text-[#FBBF24]" : "text-[#38D982]"}`}>
          ${fine.toFixed(2)}
        </span>
      </div>

      <div className="my-5 flex items-center">
        {steps.map((s) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <span
              className={`h-3 w-3 rounded-full ${
                s < active ? "bg-[#38D982]" : s === active ? "bg-[#FBBF24]" : "bg-[#2a3d33]"
              }`}
            />
            {s < steps.length - 1 && (
              <span className={`h-[3px] flex-1 ${s < active ? "bg-[#38D982]" : "bg-[#2a3d33]"}`} />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={pay}
        disabled={fine === 0}
        className="h-11 w-full rounded-lg bg-[#38D982] text-[15px] font-semibold text-[#0D1512] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {fine === 0 ? "No fines to pay" : "Pay"}
      </button>
    </section>
  );
}

/* --------------------------------- Page -------------------------------- */

export default function MyLibrary() {
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className="relative">
      {/* decorative leaves */}
      <Leaf className="pointer-events-none absolute -top-2 left-[250px] hidden h-16 w-16 rotate-[-30deg] opacity-10 md:block" />
      <Leaf className="pointer-events-none absolute -top-4 right-0 hidden h-24 w-24 rotate-[20deg] opacity-10 md:block" />

      <h1 className="font-serif text-[36px] leading-tight">My Library</h1>

      {/* tabs */}
      <div className="mt-5 flex gap-7 overflow-x-auto border-b line">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-[16px] transition ${
              tab === t
                ? "border-[#38D982] text-[#38D982]"
                : "border-transparent muted hover:text-inherit"
            }`}
          >
            {t}
            {t === "Fines & Payments" && (
              <span className="rounded-md bg-[#FBBF24] px-2 py-0.5 text-[11px] font-semibold text-[#3d2f08]">
                #FBBF24
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Currently Borrowed" && <CurrentlyBorrowed />}
        {tab === "Reservations" && <ReservationsTab />}
        {tab === "Reading History" && <HistoryTab />}
        {tab === "Wishlist" && <WishlistTab />}
        {tab === "Fines & Payments" && <FinesTab />}
      </div>
    </div>
  );
}