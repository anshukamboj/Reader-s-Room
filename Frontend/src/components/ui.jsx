import { Heart, Star } from "lucide-react";
import { useLib } from "../context/LibraryContext";

export const Cover = ({ book, className = "" }) => (
  <div className={`flex shrink-0 items-center justify-center rounded-md bg-gradient-to-b p-1.5 text-center shadow-md ${book.cover} ${className}`}>
    <span className="font-serif text-[10px] font-bold tracking-wider text-white/90">{book.sub}</span>
  </div>
);

export const Card = ({ title, subtitle, action, children }) => (
  <section className="rounded-xl border line bg-card p-4">
    <div className="mb-3 flex items-start justify-between gap-2">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && <p className="text-xs muted">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const PageTitle = ({ title, subtitle, children }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="text-sm muted">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export const Empty = ({ icon: Icon, title, text, children }) => (
  <div className="flex flex-col items-center rounded-xl border border-dashed line px-4 py-12 text-center">
    <Icon size={28} className="mb-3 text-[#48C77D]" />
    <p className="font-medium">{title}</p>
    {text && <p className="mt-1 max-w-sm text-sm muted">{text}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
);

const tones = { green: "bg-[#48C77D] text-[#0E1511]", warn: "bg-[#8B6D1C] text-[#FFF6D6]", red: "bg-red-500 text-white" };
export const Badge = ({ tone = "green", children }) => (
  <span className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
);

const fills = { green: "#48C77D", warn: "#E0B83A", red: "#ef4444" };
export const Progress = ({ value, tone = "green" }) => (
  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#7D867E]/30">
    <div className="h-full rounded-full" style={{ width: `${value}%`, background: fills[tone] }} />
  </div>
);

export function StatCard({ label, value, icon: Icon, warn }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 ${warn ? "border-[#B8942B] bg-[#8B6D1C] text-[#FFF6D6]" : "line bg-card"}`}>
      <div>
        <p className={`text-sm ${warn ? "text-[#F3E3A8]" : "muted"}`}>{label}</p>
        <p className="mt-1 text-3xl font-semibold">{value}</p>
      </div>
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${warn ? "bg-black/20 text-[#F3D675]" : "bg-[#285A3B]/40 text-[#48C77D]"}`}>
        <Icon size={20} />
      </span>
    </div>
  );
}

// Borrow / Reserve / Borrowed / Reserved, depending on the book's state
export function BookAction({ book, className = "" }) {
  const { stock, loans, reservations, borrow, reserve } = useLib();
  if (loans.some((l) => l.bookId === book.id)) return <button disabled className={`btn btn-sm ${className}`}>Borrowed</button>;
  if (reservations.some((r) => r.bookId === book.id)) return <button disabled className={`btn btn-sm ${className}`}>Reserved</button>;
  if (stock[book.id] > 0) return <button onClick={() => borrow(book.id)} className={`btn btn-primary btn-sm ${className}`}>Borrow</button>;
  return <button onClick={() => reserve(book.id)} className={`btn btn-sm hover-bg ${className}`}>Reserve</button>;
}

export function BookCard({ book, children }) {
  const { stock, wishlist, toggleWishlist } = useLib();
  const available = stock[book.id] > 0;
  const saved = wishlist.includes(book.id);
  return (
    <div className="rounded-xl border line bg-card p-3.5 transition hover:border-[#48C77D]">
      <div className="relative flex justify-center">
        <Cover book={book} className="h-[160px] w-[108px]" />
        <span className={`absolute left-0 top-0 rounded px-2 py-0.5 text-xs font-medium ${available ? "bg-[#48C77D] text-[#0E1511]" : "bg-[#8B6D1C] text-[#FFF6D6]"}`}>
          {available ? "Available" : "Unavailable"}
        </span>
        <button onClick={() => toggleWishlist(book.id)} aria-label="Wishlist" className="absolute right-0 top-0 rounded-full bg-black/40 p-1.5">
          <Heart size={15} className={saved ? "fill-red-500 text-red-500" : "text-white"} />
        </button>
      </div>
      <h3 className="mt-3 truncate font-medium">{book.title}</h3>
      <p className="truncate text-sm muted">By {book.author}</p>
      <div className="mt-1 flex items-center gap-1 text-sm muted">
        <Star size={14} className="fill-[#F5BE55] text-[#F5BE55]" /> {book.rating}
        <span className="ml-auto text-xs">{book.category}</span>
      </div>
      <div className="mt-3 flex gap-2">{children}</div>
    </div>
  );
}