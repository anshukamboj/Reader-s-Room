import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api, getToken, clearAuth } from "../api";

export const COVER_CLASSES = [
  "from-emerald-900 to-green-600", "from-amber-800 to-yellow-600", "from-teal-900 to-emerald-500",
  "from-indigo-950 to-blue-600", "from-slate-900 to-cyan-700", "from-slate-900 to-sky-700",
  "from-yellow-900 to-amber-600", "from-orange-900 to-amber-500", "from-rose-950 to-orange-700",
  "from-stone-800 to-stone-500",
];

const DAY = 86400000;
export const addDays = (n) => new Date(Date.now() + n * DAY).toISOString();
export const daysLeft = (iso) => Math.ceil((new Date(iso) - Date.now()) / DAY);
export const fmt = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const ord = (n) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

// live list, filled from the database (kept as an exported array so existing imports still work)
export const books = [];
export const bookById = (id) => books.find((b) => b.id === String(id));

export const activity = [
  { month: "Jun", books: 2 }, { month: "Jul", books: 3 }, { month: "Aug", books: 2 },
  { month: "Sep", books: 4 }, { month: "Oct", books: 3 }, { month: "Nov", books: 5 },
];

export function loanStatus(due) {
  const d = daysLeft(due);
  if (d < 0) return { d, tone: "red", label: `Overdue by ${-d} day${-d === 1 ? "" : "s"}` };
  if (d <= 3) return { d, tone: "warn", label: d === 0 ? "Due today" : `Due in ${d} day${d === 1 ? "" : "s"}` };
  return { d, tone: "green", label: `${d} days left` };
}
export const loanDays = (l) => Math.round((new Date(l.due) - new Date(l.borrowedAt)) / DAY);
export const loanProgress = (l) =>
  Math.min(100, Math.max(0, Math.round(((Date.now() - new Date(l.borrowedAt)) / (new Date(l.due) - new Date(l.borrowedAt))) * 100)));

const Ctx = createContext(null);
export const useLib = () => useContext(Ctx);
export const useLibrary = useLib;

export function LibraryProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("rr_user") || "null") || { name: "Guest", email: "" });
  const [dark, setDark] = useState(() => localStorage.getItem("ecolib_theme") !== "light");
  const [, setBooksVersion] = useState(0);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [history, setHistory] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState("");
  const timer = useRef();

  const notify = (msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2800);
  };
  const setTheme = (v) => { setDark(v); localStorage.setItem("ecolib_theme", v ? "dark" : "light"); };

  const loadAll = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [bk, lib, me] = await Promise.all([api("/books"), api("/library"), api("/auth/me")]);
      books.splice(0, books.length, ...bk);
      setBooksVersion((v) => v + 1);
      setLoans(lib.loans);
      setReservations(lib.reservations);
      setHistory(lib.history);
      setWishlist(lib.wishlist);
      setUser(me);
      localStorage.setItem("rr_user", JSON.stringify(me));
    } catch (e) {
      if (/session|logged in/i.test(e.message)) clearAuth();
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const logout = () => {
    clearAuth();
    books.splice(0, books.length);
    setLoans([]); setReservations([]); setHistory([]); setWishlist([]);
    setUser({ name: "Guest", email: "" });
  };

  const act = async (path, method = "POST") => {
    try {
      const r = await api(path, { method });
      notify(r.message);
      await loadAll();
    } catch (e) {
      notify(e.message);
    }
  };

  const borrow = (id) => act(`/library/borrow/${id}`);
  const reserve = (id) => act(`/library/reserve/${id}`);
  const cancelReservation = (id) => act(`/library/reserve/${id}`, "DELETE");
  const pickUp = (id) => act(`/library/pickup/${id}`);
  const renew = (id) => act(`/library/renew/${id}`);
  const returnBook = (id) => act(`/library/return/${id}`);
  const toggleWishlist = (id) => act(`/library/wishlist/${id}`);

  const stock = Object.fromEntries(books.map((b) => [b.id, b.available]));
  const title = (id) => bookById(id)?.title ?? "Book";

  const alerts = [
    ...loans.filter((l) => daysLeft(l.due) <= 3).map((l) => ({ id: "l" + l.bookId, to: "/dashboard/my-library", text: `"${title(l.bookId)}": ${loanStatus(l.due).label}` })),
    ...reservations.filter((r) => r.status === "ready").map((r) => ({ id: "r" + r.bookId, to: "/dashboard/reservations", text: `"${title(r.bookId)}" is ready for pickup` })),
  ];

  return (
    <Ctx.Provider value={{ user, setUser, dark, setTheme, stock, loans, reservations, history, wishlist, toast, alerts, notify, loadAll, logout, borrow, reserve, cancelReservation, pickUp, renew, returnBook, toggleWishlist }}>
      {children}
    </Ctx.Provider>
  );
}