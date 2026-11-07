import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search, Bell, ChevronDown, ChevronLeft, ChevronRight, Sun, Moon, X,
  Heart, Star, BookOpen, SlidersHorizontal,
} from "lucide-react";

/* ---------------- MOCK DATA ---------------- */
const base = [
  { title: "The Hidden Forest", author: "Same Bothor", category: "Nature", isbn: "12344565678980", publisher: "Axther Beyar", year: 2021, rating: 5.0, total: 5, available: 2, shelf: "A-14", lang: "English", cover: "from-emerald-900 to-green-600", sub: "NATURE" },
  { title: "History: History", author: "Axther Beyar", category: "History", isbn: "98765432101", publisher: "Old Press", year: 2020, rating: 5.3, total: 4, available: 3, shelf: "B-02", lang: "English", cover: "from-amber-800 to-yellow-600", sub: "THE HISTORY" },
  { title: "Lbrens Story", author: "Author", category: "History", isbn: "11223344556", publisher: "Axther Beyar", year: 2022, rating: 5.3, total: 3, available: 1, shelf: "B-07", lang: "French", cover: "from-orange-900 to-amber-500", sub: "ELYUEA HISTORY" },
  { title: "Science Therapy", author: "Science", category: "Library", isbn: "55443322110", publisher: "Nova Books", year: 2023, rating: 4.9, total: 6, available: 4, shelf: "C-10", lang: "English", cover: "from-indigo-950 to-blue-600", sub: "SCIENCE" },
  { title: "Hitor History", author: "Asther Beyar", category: "History", isbn: "66778899001", publisher: "Nova Books", year: 2021, rating: 4.9, total: 2, available: 2, shelf: "B-11", lang: "English", cover: "from-stone-950 to-orange-700", sub: "THE HISTORY" },
  { title: "Anepson Story", author: "Science", category: "Schemoinary", isbn: "77889900112", publisher: "Old Press", year: 2020, rating: 3.3, total: 2, available: 0, shelf: "D-01", lang: "French", cover: "from-stone-200 to-stone-400", sub: "ANEPSON" },
  { title: "Science Atlas", author: "Eodle Gonon", category: "Library", isbn: "33221100998", publisher: "Nova Books", year: 2022, rating: 4.2, total: 5, available: 3, shelf: "C-04", lang: "English", cover: "from-slate-900 to-cyan-700", sub: "ATLAS" },
  { title: "River Notes", author: "Same Bothor", category: "Nature", isbn: "44556677889", publisher: "Green Leaf", year: 2023, rating: 4.0, total: 4, available: 0, shelf: "A-09", lang: "French", cover: "from-teal-900 to-emerald-500", sub: "RIVER" },
  { title: "Quiet Libraries", author: "Eodle Gonon", category: "Library", isbn: "22110099887", publisher: "Green Leaf", year: 2021, rating: 3.8, total: 3, available: 2, shelf: "C-15", lang: "English", cover: "from-zinc-800 to-lime-700", sub: "LIBRARY" },
  { title: "Old Maps", author: "Asther Beyar", category: "Poeroan:iwns", isbn: "99001122334", publisher: "Old Press", year: 2020, rating: 4.6, total: 2, available: 1, shelf: "E-03", lang: "English", cover: "from-yellow-900 to-amber-600", sub: "MAPS" },
];
const books = [...base, ...base].map((b, i) => ({
  ...b, id: i + 1, title: i >= 10 ? b.title + " II" : b.title,
  isbn: String(Number(b.isbn) + i), rating: Math.round((b.rating - (i >= 10 ? 0.2 : 0)) * 10) / 10,
  desc: `${b.title} is a calm and detailed read about ${b.category.toLowerCase()}. It follows careful research, field notes and stories from people who spent years studying the subject. Readers say it is easy to follow and hard to put down, with chapters that work well on their own. A good pick for slow weekends and long study sessions.`,
}));

const PER_PAGE = 8;
const categories = ["Nature", "History", "Library", "Poeroan:iwns", "Schemoinary"];
const authors = ["Same Bothor", "Asther Beyar", "Eodle Gonon"];
const years = ["2020 - 2023"];
const languages = ["English", "French"];
const availabilities = ["Available", "Reserved"];
const ratings = [5, 4, 3];
const LOCK_MS = 2000; // how long the other ratings stay blocked (2 seconds)

/* ---------------- SMALL PIECES ---------------- */
const Stars = ({ value, size = 14 }) => (
  <span className="flex">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={size}
        className={n <= Math.round(value) ? "fill-[#F5BE55] text-[#F5BE55]" : "text-[#4a554d]"} />
    ))}
  </span>
);

const Cover = ({ book, className = "" }) => (
  <div className={`bg-gradient-to-b ${book.cover} rounded-sm flex items-center justify-center text-center p-2 shadow-md ${className}`}>
    <span className="font-serif text-sm font-bold tracking-wider text-white/90 drop-shadow">{book.sub}</span>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 text-sm text-[#A6ADA5] cursor-pointer py-1.5 hover:text-[#F0F0E3]">
    <input type="checkbox" checked={checked} onChange={onChange} className="accent-[#38D982] w-4 h-4" />
    {label}
  </label>
);

/* ---------------- NAVBAR ---------------- */
function Navbar({ page, setPage, dark, setDark }) {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const links = ["Home", "Explore Books", "Features", "About"];
 const routes = { Home: "/", "Explore Books": "/Books", Features: "/features", About: "/about" };

  // is someone logged in? (saved by your Login page)
  const token = localStorage.getItem("rr_token");
  let user = null;
  try { user = JSON.parse(localStorage.getItem("rr_user")); } catch {}
  const isLoggedIn = !!token && !!user;

  const go = (l) => {
    setPage(l);
    if (routes[l]) navigate(routes[l]);
  };

  const logout = () => {
    localStorage.removeItem("rr_token");
    localStorage.removeItem("rr_user");
    setMenu(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 shrink-0 border-b border-white/10 bg-[#0f1a15]/80 backdrop-blur flex items-center gap-5 px-5 sm:px-8 relative">
      <div className="flex items-center gap-2 text-[#eef3ee]">
        <BookOpen size={24} className="text-[#38D982]" />
        <span className="font-serif text-lg font-medium">Reader's Room</span>
      </div>

      <div className="ml-auto flex h-full items-center gap-6">
        <nav className="hidden md:flex h-full gap-6">
          {links.map((l) => (
            <button key={l} onClick={() => go(l)}
              className={`text-sm h-full border-b-2 ${page === l ? "border-[#38D982] text-[#eef3ee]" : "border-transparent text-[#eef3ee]/70 hover:text-[#eef3ee]"}`}>
              {l}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-[#A6ADA5]">
          {isLoggedIn ? (
            <>
              <button className="relative" onClick={() => alert("No new notifications (demo)")}>
                <Bell size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
              </button>
              <button onClick={() => setMenu(!menu)} className="flex items-center gap-1">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-emerald-700 block" />
                <ChevronDown size={16} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}
                className="text-sm text-[#eef3ee] hover:text-[#38D982]">Log in</button>
              <button onClick={() => navigate("/signup")}
                className="text-sm h-9 px-4 rounded bg-[#38D982] text-[#0D1512] font-semibold hover:brightness-110">Sign up</button>
            </>
          )}
          <button onClick={() => setDark(!dark)}>{dark ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button className="md:hidden" onClick={() => setMenu(!menu)}><SlidersHorizontal size={20} /></button>
        </div>
      </div>

      {menu && (
        <div className="absolute right-4 top-14 z-40 w-48 bg-[#1B2821] border border-[#2C3C32] rounded p-2 text-sm text-[#F0F0E3] space-y-1">
          {links.map((l) => (
            <button key={l} onClick={() => { go(l); setMenu(false); }} className="block w-full text-left px-3 py-1.5 rounded hover:bg-[#2C3C32] md:hidden">{l}</button>
          ))}
          {isLoggedIn ? (
            <>
              <button className="block w-full text-left px-3 py-1.5 rounded hover:bg-[#2C3C32]">Profile</button>
              <button onClick={logout} className="block w-full text-left px-3 py-1.5 rounded hover:bg-[#2C3C32]">Log out</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="block w-full text-left px-3 py-1.5 rounded hover:bg-[#2C3C32] md:hidden">Log in</button>
              <button onClick={() => navigate("/signup")} className="block w-full text-left px-3 py-1.5 rounded hover:bg-[#2C3C32] md:hidden">Sign up</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

/* ---------------- FILTER SIDEBAR ---------------- */
function Group({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[#2C3C32] py-3">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-base text-[#F0F0E3] mb-1">
        {title}
        <ChevronDown size={16} className={`transition ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && children}
    </div>
  );
}

function FilterSidebar({ filters, toggle, clear, ratingLock }) {
  const list = (key, items) =>
    items.map((i) => (
      <Checkbox key={i} label={i} checked={filters[key].includes(i)} onChange={() => toggle(key, i)} />
    ));
  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl text-[#F0F0E3]">Filter</h2>
        <button onClick={clear} className="text-sm text-[#38D982] hover:underline">Clear all</button>
      </div>
      <Group title="Categories">{list("category", categories)}</Group>
      <Group title="Authors">{list("author", authors)}</Group>
      <Group title="Publication Years">{list("year", years)}</Group>
      <Group title="Language">{list("lang", languages)}</Group>
      <Group title="Availability">{list("availability", availabilities)}</Group>
      <Group title="Ratings">
        {ratings.map((r) => {
          const checked = filters.rating.includes(r);
          // other ratings are blocked only while the 2 second lock is running
          const blocked = ratingLock !== null && ratingLock !== r;
          return (
            <label key={r}
              className={`flex items-center gap-2.5 py-1.5 transition-opacity ${blocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
              <input type="checkbox" checked={checked} disabled={blocked}
                onChange={() => toggle("rating", r)}
                className="accent-[#38D982] w-4 h-4 disabled:cursor-not-allowed" />
              <Stars value={r} size={14} />
              <span className="text-sm text-[#A6ADA5] ml-auto">{r.toFixed(1)}+</span>
            </label>
          );
        })}
      </Group>
    </aside>
  );
}

/* ---------------- TOOLBAR ---------------- */
function BooksToolbar({ sort, setSort, order, setOrder, query, setQuery }) {
  const sel = "bg-transparent text-sm text-[#A6ADA5] outline-none cursor-pointer";
  return (
    <div className="flex flex-wrap items-center gap-4 p-3 mb-4 rounded-md border border-[#2C3C32] bg-[#111814]">
      <select value={sort} onChange={(e) => setSort(e.target.value)} className={sel}>
        <option className="bg-[#111814]" value="">Sort by</option>
        <option className="bg-[#111814]" value="title">Title</option>
        <option className="bg-[#111814]" value="rating">Rating</option>
        <option className="bg-[#111814]" value="year">Publication year</option>
      </select>
      <select value={order} onChange={(e) => setOrder(e.target.value)} className={sel}>
        <option className="bg-[#111814]" value="none">Most None</option>
        <option className="bg-[#111814]" value="asc">Lowest first</option>
        <option className="bg-[#111814]" value="desc">Highest first</option>
      </select>
      <div className="flex items-center gap-2 flex-1 min-w-[200px] h-10 px-3 rounded border border-[#2C3C32] bg-[#0D1512]">
        <Search size={16} className="text-[#7D867E]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, ISBN, or category..."
          className="bg-transparent outline-none text-sm text-[#F0F0E3] placeholder:text-[#7D867E] w-full" />
      </div>
    </div>
  );
}

/* ---------------- BOOK CARD + GRID ---------------- */
function BookCard({ book, status, onOpen }) {
  const reserved = status === "Reserved";
  return (
    <div className="rounded-md border border-[#2C3C32] bg-[#1B2821] p-3.5 hover:border-[#38D982] transition">
      <div className="relative flex justify-center">
        <Cover book={book} className="w-[110px] h-[165px]" />
        <span className={`absolute top-0 right-0 text-xs px-2 py-1 rounded ${reserved ? "bg-[#8a6a3a] text-[#F0F0E3]" : "bg-[#4fe08e] text-[#0D1512]"}`}>
          {status}
        </span>
      </div>
      <h3 className="mt-3 text-base font-medium text-[#F0F0E3] truncate">{book.title}</h3>
      <p className="text-sm text-[#A6ADA5] truncate">By {book.author}</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Stars value={book.rating} />
        <span className="text-sm text-[#A6ADA5]">{book.rating}</span>
      </div>
      <button onClick={() => onOpen(book)}
        className="mt-3 w-full h-9 text-sm rounded border border-[#3a4d40] text-[#F0F0E3] hover:bg-[#2C3C32]">
        View Details
      </button>
    </div>
  );
}

function BookGrid({ items, getStatus, onOpen, pad = 0 }) {
  if (!items.length)
    return <p className="text-base text-[#7D867E] py-10 text-center">No books match your filters. Try clearing some.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((b) => <BookCard key={b.id} book={b} status={getStatus(b)} onOpen={onOpen} />)}
      {Array.from({ length: pad }, (_, i) => (
        <div key={`pad-${i}`} className="invisible" aria-hidden="true">
          <BookCard book={items[0]} status={getStatus(items[0])} onOpen={() => {}} />
        </div>
      ))}
    </div>
  );
}

/* ---------------- PAGINATION ---------------- */
function Pagination({ page, pages, setPage }) {
  const btn = "w-9 h-9 text-sm rounded border flex items-center justify-center";
  return (
    <div className="flex justify-center gap-2 mt-8 mb-12">
      <button disabled={page === 1} onClick={() => setPage(page - 1)} className={`${btn} border-[#2C3C32] text-[#A6ADA5] disabled:opacity-40`}><ChevronLeft size={16} /></button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button key={n} onClick={() => setPage(n)}
          className={`${btn} ${n === page ? "bg-[#38D982] border-[#38D982] text-[#0D1512]" : "border-[#2C3C32] text-[#A6ADA5]"}`}>{n}</button>
      ))}
      <button disabled={page === pages} onClick={() => setPage(page + 1)} className={`${btn} border-[#2C3C32] text-[#A6ADA5] disabled:opacity-40`}><ChevronRight size={16} /></button>
    </div>
  );
}

/* ---------------- RELATED + DRAWER ---------------- */
function RelatedBooks({ book, onPick }) {
  const related = books.filter((b) => b.id !== book.id && b.category === book.category).slice(0, 3);
  const list = related.length === 3 ? related : books.filter((b) => b.id !== book.id).slice(0, 3);
  return (
    <div className="border-t border-[#2C3C32] pt-4 mt-5">
      <h4 className="font-serif text-base text-[#F0F0E3] mb-3">Related Books</h4>
      <div className="grid grid-cols-3 gap-2">
        {list.map((b) => (
          <button key={b.id} onClick={() => onPick(b)} className="rounded border border-[#2C3C32] bg-[#1B2821] p-1.5 hover:border-[#38D982]">
            <Cover book={b} className="w-full h-20" />
          </button>
        ))}
      </div>
    </div>
  );
}

function BookDetailsDrawer({ book, avail, fav, reserved, onClose, onBorrow, onReserve, onFav, onPick }) {
  const [more, setMore] = useState(false);
  const info = [["Author", book.author], ["ISBN", book.isbn], ["Publisher", book.publisher], ["Year", book.year], ["Category", book.category]];
  return (
    <div className="fixed z-30 bottom-0 right-0 left-0 sm:left-auto sm:right-4 sm:w-[380px] h-[85vh] sm:h-[640px] max-h-[calc(100vh-60px)] overflow-y-auto rounded-t-xl border border-[#2C3C32] bg-[#0f1713] shadow-2xl p-5 text-[#F0F0E3]">
      <button onClick={onClose} className="absolute top-3 right-3 text-[#A6ADA5] hover:text-white"><X size={20} /></button>
      <div className="flex gap-4 mt-4">
        <Cover book={book} className="w-[120px] h-[170px] shrink-0" />
        <div className="min-w-0">
          <h3 className="font-serif text-xl mb-1">{book.title}</h3>
          {info.map(([k, v]) => (
            <p key={k} className="text-sm text-[#A6ADA5] leading-6">{k}: <span className="text-[#F0F0E3]">{v}</span></p>
          ))}
        </div>
      </div>
      <p className="text-sm leading-6 text-[#A6ADA5] mt-4">
        {more ? book.desc : book.desc.slice(0, 120) + "... "}
        <button onClick={() => setMore(!more)} className="text-[#38D982]">{more ? "Show less" : "Read More"}</button>
      </p>
      <div className="grid grid-cols-2 mt-5 text-sm text-[#A6ADA5]">
        <div>Total Copies<p className="text-xl text-[#F0F0E3]">{book.total}</p></div>
        <div>Available Copies<p className="text-xl text-[#F0F0E3]">{avail}</p></div>
      </div>
      <div className={`inline-block mt-4 text-sm px-3 py-2 rounded border ${avail > 0 ? "bg-[#1d4a33] border-[#38D982] text-[#7df0b0]" : "bg-[#4a3a1d] border-[#8a6a3a] text-[#e6c07a]"}`}>
        {avail > 0 ? `Available - Shelf ${book.shelf}` : "Not available - you can reserve"}
      </div>
      <button onClick={onBorrow} className="mt-4 w-full h-10 rounded bg-[#38D982] text-[#0D1512] text-sm font-semibold hover:brightness-110">Borrow</button>
      <div className="flex gap-2 mt-2">
        <button onClick={onReserve} className="flex-1 h-10 rounded border border-[#F0F0E3]/70 text-sm hover:bg-[#1B2821]">
          {reserved ? "Cancel Reservation" : "Reserve"}
        </button>
        <button onClick={onFav} className="w-10 h-10 rounded border border-[#3a4d40] flex items-center justify-center">
          <Heart size={18} className={fav ? "fill-red-500 text-red-500" : "text-[#A6ADA5]"} />
        </button>
      </div>
      <RelatedBooks book={book} onPick={onPick} />
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */
export default function ExploreBooks() {
  const [navPage, setNavPage] = useState("Explore Books");
  const [dark, setDark] = useState(true);
  const [filters, setFilters] = useState({ category: [], author: [], year: [], lang: [], availability: [], rating: [] });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("");
  const [order, setOrder] = useState("none");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);
  const [favs, setFavs] = useState([]);
  const [reservedIds, setReservedIds] = useState([]);
  const [borrowed, setBorrowed] = useState({});
  const [toast, setToast] = useState("");

  // rating lock (hooks must live INSIDE the component)
  const [ratingLock, setRatingLock] = useState(null);
  const lockTimer = useRef(null);
  useEffect(() => () => clearTimeout(lockTimer.current), []);

  // keep the page size/position the same: always reserve the scrollbar space and start at the top
  useEffect(() => {
    const prev = document.documentElement.style.scrollbarGutter;
    document.documentElement.style.scrollbarGutter = "stable";
    window.scrollTo(0, 0);
    return () => { document.documentElement.style.scrollbarGutter = prev; };
  }, []);

  const avail = (b) => b.available - (borrowed[b.id] || 0);
  const status = (b) => (avail(b) > 0 ? "Available" : "Reserved");

  const say = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const toggle = (key, value) => {
    if (key === "rating") {
      // while locked, only the selected rating can be clicked
      if (ratingLock !== null && ratingLock !== value) return;
      clearTimeout(lockTimer.current);

      if (filters.rating.includes(value)) {
        // click the selected one again -> unselect, no lock
        setFilters((f) => ({ ...f, rating: [] }));
        setRatingLock(null);
      } else {
        // only ONE rating at a time: replace the old one, lock others for 2 seconds
        setFilters((f) => ({ ...f, rating: [value] }));
        setRatingLock(value);
        lockTimer.current = setTimeout(() => setRatingLock(null), LOCK_MS);
      }
      setPage(1);
      return;
    }
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));
    setPage(1);
  };

  const clear = () => {
    setFilters({ category: [], author: [], year: [], lang: [], availability: [], rating: [] });
    setQuery(""); setPage(1);
    clearTimeout(lockTimer.current);
    setRatingLock(null);
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = books.filter((b) => {
      if (q && !(b.title + b.isbn + b.category).toLowerCase().includes(q)) return false;
      if (filters.category.length && !filters.category.includes(b.category)) return false;
      if (filters.author.length && !filters.author.includes(b.author)) return false;
      if (filters.year.length && !(b.year >= 2020 && b.year <= 2023)) return false;
      if (filters.lang.length && !filters.lang.includes(b.lang)) return false;
      if (filters.availability.length && !filters.availability.includes(status(b))) return false;
      if (filters.rating.length && !filters.rating.some((r) => b.rating >= r)) return false;
      return true;
    });
    if (sort) {
      list = [...list].sort((a, b) => (sort === "title" ? a.title.localeCompare(b.title) : a[sort] - b[sort]));
      if (order === "desc") list.reverse();
    }
    return list;
  }, [query, filters, sort, order, borrowed]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const pad = pages > 1 && visible.length ? PER_PAGE - visible.length : 0;

  const changePage = (n) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const borrow = () => {
    if (avail(selected) <= 0) return say("No copies available. Try reserving instead.");
    setBorrowed({ ...borrowed, [selected.id]: (borrowed[selected.id] || 0) + 1 });
    say(`You borrowed "${selected.title}". Pick it up at shelf ${selected.shelf}.`);
  };
  const reserve = () => {
    const has = reservedIds.includes(selected.id);
    setReservedIds(has ? reservedIds.filter((i) => i !== selected.id) : [...reservedIds, selected.id]);
    say(has ? "Reservation cancelled." : `"${selected.title}" reserved for you.`);
  };
  const fav = () =>
    setFavs(favs.includes(selected.id) ? favs.filter((i) => i !== selected.id) : [...favs, selected.id]);

  return (
    <div className={`min-h-screen bg-[#0D1512] text-[#F0F0E3] ${dark ? "" : "invert hue-rotate-180"}`}>
      <Navbar page={navPage} setPage={setNavPage} dark={dark} setDark={setDark} />

      <main className="bg-[#101814] px-4 sm:px-8 pb-20">
        <div className="pt-8 pb-6">
          <h1 className="font-serif text-4xl sm:text-5xl text-[#F0F0E3]">Explore the Library</h1>
          <p className="text-base text-[#7D867E] mt-1">{filtered.length.toLocaleString()} books available</p>
        </div>

        <button onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-1.5 text-sm text-[#38D982] mb-4">
          <SlidersHorizontal size={16} /> {showFilters ? "Hide filters" : "Show filters"}
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`${showFilters ? "block" : "hidden"} lg:block lg:w-[230px] shrink-0`}>
            <FilterSidebar filters={filters} toggle={toggle} clear={clear} ratingLock={ratingLock} />
          </div>

          <section className="flex-1 min-w-0">
            <BooksToolbar sort={sort} setSort={setSort} order={order} setOrder={setOrder}
              query={query} setQuery={(v) => { setQuery(v); setPage(1); }} />
            <BookGrid items={visible} getStatus={status} onOpen={setSelected} pad={pad} />
            <Pagination page={current} pages={pages} setPage={changePage} />
          </section>
        </div>
      </main>

      {selected && (
        <BookDetailsDrawer
          book={selected} avail={avail(selected)}
          fav={favs.includes(selected.id)} reserved={reservedIds.includes(selected.id)}
          onClose={() => setSelected(null)} onBorrow={borrow} onReserve={reserve} onFav={fav}
          onPick={setSelected}
        />
      )}

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1B2821] border border-[#38D982] text-sm px-5 py-2.5 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}