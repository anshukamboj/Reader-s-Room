import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api } from "../api";
import { useLibrary } from "../context/LibraryContext";

const PAGE = 10;
const filterKeys = ["Category", "Availability", "Publisher", "Publication Year", "Inventory Status"];

const badge = {
  Available: "border-[#38D982]/70 bg-[#143824] text-[#7be8ad]",
  Damaged: "border-[#FBBF24]/70 bg-[#4a3a12] text-[#FBBF24]",
  Unavailable: "border-[#FBBF24]/70 bg-[#4a3a12] text-[#FBBF24]",
  Lost: "border-red-500/60 bg-red-900/40 text-red-300",
  Archived: "border-[#4b6455] bg-[#1d2a23] text-[#9bb0a4]",
};

// derived labels
const stockOf = (b) => (b.archived ? "Archived" : b.available === 0 ? "Out of Stock" : b.available === 1 ? "Low Stock" : "In Stock");
const availOf = (b) => (b.available > 0 ? "Available" : "Unavailable");
const badgeOf = (b) => (b.archived ? "Archived" : b.available === 0 ? "Unavailable" : b.damaged > 0 ? "Damaged" : "Available");

const match = {
  Category: (b, v) => b.category === v,
  Availability: (b, v) => (v === "Has damaged" ? b.damaged > 0 : availOf(b) === v),
  Publisher: (b, v) => b.publisher === v,
  "Publication Year": (b, v) => String(b.year) === v,
  "Inventory Status": (b, v) => stockOf(b) === v,
};

const uniq = (a) => [...new Set(a.filter(Boolean).map(String))].sort();

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
};

/* ------------------------------ Pieces ------------------------------ */

function GreenBtn({ icon: Icon, children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 items-center gap-1.5 rounded-lg bg-[#38D982] px-3.5 text-[13px] font-semibold text-[#0D1512] hover:brightness-110 ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-[#2a3d33] bg-[#16231c] py-0 pl-3 pr-8 text-[13px] text-white outline-none focus:border-[#3b8259]"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9bb0a4]" />
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

const fieldCls =
  "h-10 w-full rounded-lg border border-[#2a3d33] bg-[#16231c] px-3 text-[14px] text-white placeholder-[#7f948a] outline-none focus:border-[#3b8259]";

/* ------------------------------ Book modal -------------------------- */

function BookModal({ initial, categories, onClose, onSave }) {
  const edit = !!initial;
  const [form, setForm] = useState({
    title: initial?.title || "",
    author: initial?.author || "",
    isbn: initial?.isbn || "",
    category: initial?.category || "",
    publisher: initial?.publisher || "",
    year: initial?.year || "",
    shelf: initial?.shelf || "",
    copies: "1",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.title.trim() || !form.author.trim()) return setErr("Title and author are required.");
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
      <form onSubmit={submit} className="w-full max-w-lg space-y-3 rounded-xl border border-[#26382f] bg-[#131f19] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium text-white">{edit ? "Edit Book" : "Add Book"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#cfdcd3]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {err && <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">{err}</p>}

        <div className="grid grid-cols-2 gap-3">
          <input className={`${fieldCls} col-span-2`} placeholder="Title" value={form.title} onChange={set("title")} />
          <input className={fieldCls} placeholder="Author" value={form.author} onChange={set("author")} />
          <input className={fieldCls} placeholder="ISBN" value={form.isbn} onChange={set("isbn")} />
          <input className={fieldCls} list="categories" placeholder="Category" value={form.category} onChange={set("category")} />
          <datalist id="categories">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
          <input className={fieldCls} placeholder="Publisher" value={form.publisher} onChange={set("publisher")} />
          <input className={fieldCls} type="number" placeholder="Publication year" value={form.year} onChange={set("year")} />
          <input className={fieldCls} placeholder="Shelf (e.g. A-14)" value={form.shelf} onChange={set("shelf")} />
          {!edit && (
            <input className={`${fieldCls} col-span-2`} type="number" min="1" placeholder="Number of copies" value={form.copies} onChange={set("copies")} />
          )}
        </div>

        <button disabled={busy} className="h-10 w-full rounded-lg bg-[#38D982] text-[14px] font-semibold text-[#0D1512] hover:brightness-110 disabled:opacity-60">
          {busy ? "Saving..." : edit ? "Save changes" : "Add book"}
        </button>
      </form>
    </div>
  );
}

/* ----------------------------- Add copy modal ----------------------- */

function AddCopyModal({ books, onClose, onSave }) {
  const [bookId, setBookId] = useState(books[0]?.id || "");
  const [condition, setCondition] = useState("Good");
  const [location, setLocation] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!bookId) return setErr("Choose a book.");
    setBusy(true);
    try {
      await onSave({ bookId, condition, location });
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
          <h2 className="text-[18px] font-medium text-white">Add Copy</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#cfdcd3]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {err && <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">{err}</p>}
        <select className={fieldCls} value={bookId} onChange={(e) => setBookId(e.target.value)}>
          {books.map((b) => (
            <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
          ))}
        </select>
        <select className={fieldCls} value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option>Good</option>
          <option>Worn</option>
          <option>Damaged</option>
        </select>
        <input className={fieldCls} placeholder="Location (optional, e.g. Shelf A-14)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <button disabled={busy} className="h-10 w-full rounded-lg bg-[#38D982] text-[14px] font-semibold text-[#0D1512] hover:brightness-110 disabled:opacity-60">
          {busy ? "Adding..." : "Add copy"}
        </button>
      </form>
    </div>
  );
}

/* ------------------------- Copy management panel -------------------- */

function CopyPanel({ book, onClose, onChanged }) {
  const { notify } = useLibrary();
  const [copies, setCopies] = useState(null);

  useEffect(() => {
    let alive = true;
    setCopies(null);
    api(`/books/${book.id}/copies`)
      .then((d) => alive && setCopies(d))
      .catch((e) => notify(e.message));
    return () => {
      alive = false;
    };
  }, [book.id]);

  const refresh = async () => {
    setCopies(await api(`/books/${book.id}/copies`));
    onChanged();
  };

  const act = async (fn, msg) => {
    try {
      await fn();
      await refresh();
      if (msg) notify(msg);
    } catch (e) {
      notify(e.message);
    }
  };

  const patch = (c, body) => act(() => api(`/books/copies/${c.id}`, { method: "PATCH", body }));
  const remove = (c) => {
    if (window.confirm(`Remove copy ${c.barcode}?`))
      act(() => api(`/books/copies/${c.id}`, { method: "DELETE" }), "Copy removed.");
  };
  const add = () => act(() => api(`/books/${book.id}/copies`, { method: "POST", body: {} }), "Copy added.");

  const onLoan = Math.max(0, book.total - book.available - book.damaged);
  const small = "h-8 rounded-md border border-[#2a3d33] bg-[#16231c] px-2 text-[12px] text-white outline-none focus:border-[#3b8259]";

  return (
    <div className="fixed bottom-0 right-0 z-40 w-full max-w-[460px] rounded-tl-xl border border-[#26382f] bg-[#0f1914] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#26382f] px-5 py-3.5">
        <h2 className="text-[16px] font-medium text-white">Inventory Copy Management</h2>
        <button onClick={onClose} aria-label="Close" className="text-[#cfdcd3] hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-start justify-between gap-3 px-5 py-3">
        <div className="text-[13px] leading-snug text-white">
          <p className="font-medium">Manage Copies: {book.title}</p>
          <p className="text-[#b9c8be]">({book.isbn || "No ISBN"})</p>
          <p className="mt-1 text-[12px] text-[#9bb0a4]">
            {book.total} total · {book.available} available · {onLoan} on loan · {book.damaged} damaged/lost
          </p>
        </div>
        <GreenBtn icon={Plus} onClick={add} className="h-8 px-3 text-[12px]">Add Copy</GreenBtn>
      </div>

      <div className="max-h-[300px] space-y-2 overflow-y-auto px-4 pb-5">
        {!copies && <p className="px-1 py-4 text-[13px] text-[#9bb0a4]">Loading copies...</p>}
        {copies?.length === 0 && <p className="px-1 py-4 text-[13px] text-[#9bb0a4]">No copies yet.</p>}

        {copies?.map((c) => (
          <div key={c.id} className="rounded-lg border border-[#26382f] bg-[#131f19] px-3 py-2.5 text-[12px] text-white">
            <div className="flex items-center justify-between">
              <p className="font-medium">#{c.barcode}</p>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${badge[c.status]}`}>{c.status}</span>
                <button onClick={() => remove(c)} aria-label="Remove copy" className="text-[#f87171] hover:text-red-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <select className={small} value={c.status} onChange={(e) => patch(c, { status: e.target.value })}>
                <option>Available</option>
                <option>Damaged</option>
                <option>Lost</option>
              </select>
              <select className={small} value={c.condition} onChange={(e) => patch(c, { condition: e.target.value })}>
                <option>Good</option>
                <option>Worn</option>
                <option>Damaged</option>
              </select>
              <input
                key={c.location}
                className={small}
                defaultValue={c.location}
                onBlur={(e) => e.target.value !== c.location && patch(c, { location: e.target.value })}
                aria-label="Location"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Page ------------------------------ */

export default function CatalogInventory() {
  const { notify } = useLibrary();
  const [params] = useSearchParams();
  const fileRef = useRef(null);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState(params.get("q") || "");
  const [filters, setFilters] = useState(Object.fromEntries(filterKeys.map((k) => [k, ""])));
  const [page, setPage] = useState(1);
  const [manageId, setManageId] = useState(null);
  const [modal, setModal] = useState(null); // { type: "book", book? } | { type: "copy" }

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  const load = useCallback(async () => {
    try {
      setBooks(await api("/books"));
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
  }, [q, filters]);

  const setFilter = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));

  const options = useMemo(
    () => ({
      Category: uniq(books.map((b) => b.category)),
      Availability: ["Available", "Unavailable", "Has damaged"],
      Publisher: uniq(books.map((b) => b.publisher)),
      "Publication Year": uniq(books.map((b) => b.year)).sort((a, b) => b - a),
      "Inventory Status": ["In Stock", "Low Stock", "Out of Stock", "Archived"],
    }),
    [books]
  );

  const visible = useMemo(() => {
    const s = q.trim().toLowerCase();
    return books.filter((b) => {
      if (s && ![b.title, b.author, b.isbn].some((x) => (x || "").toLowerCase().includes(s))) return false;
      return filterKeys.every((k) => !filters[k] || match[k](b, filters[k]));
    });
  }, [books, q, filters]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE));
  const rows = visible.slice((page - 1) * PAGE, page * PAGE);
  const manageBook = books.find((b) => b.id === manageId);

  const chips = filterKeys.filter((k) => filters[k]).map((k) => ({ key: k, label: `${k}: ${filters[k]}` }));

  const run = async (fn, okMsg) => {
    try {
      await fn();
      await load();
      if (okMsg) notify(okMsg);
    } catch (e) {
      notify(e.message);
    }
  };

  const saveBook = async (form) => {
    if (modal.book) await api(`/books/${modal.book.id}`, { method: "PUT", body: form });
    else await api("/books", { method: "POST", body: form });
    await load();
    notify(modal.book ? "Book updated." : "Book added.");
    setModal(null);
  };

  const saveCopy = async ({ bookId, condition, location }) => {
    await api(`/books/${bookId}/copies`, { method: "POST", body: { condition, location } });
    await load();
    notify("Copy added.");
    setModal(null);
  };

  const toggleArchive = (b) =>
    run(() => api(`/books/${b.id}/archive`, { method: "PATCH" }), b.archived ? "Book restored." : "Book archived.");

  const deleteBook = (b) => {
    if (window.confirm(`Delete "${b.title}" and all its copies? This can't be undone.`))
      run(() => api(`/books/${b.id}`, { method: "DELETE" }), "Book deleted.");
  };

  const exportCsv = () => {
    const head = ["title", "author", "isbn", "category", "publisher", "year", "shelf", "copies"];
    const body = books.map((b) => [b.title, b.author, b.isbn, b.category, b.publisher, b.year, b.shelf, b.total]);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [head, ...body].map((r) => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalog.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (file) => {
    try {
      const rows = parseCsv(await file.text());
      const head = rows.shift().map((h) => h.trim().toLowerCase());
      const list = rows.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
      const res = await api("/books/bulk", { method: "POST", body: { books: list } });
      await load();
      notify(`Imported ${res.created} book(s)${res.skipped ? `, skipped ${res.skipped}` : ""}.`);
    } catch (e) {
      notify(e.message || "Could not read that file.");
    }
  };

  const cols = "grid-cols-[64px_1.3fr_1.25fr_0.8fr_0.6fr_0.7fr_0.8fr_0.9fr_210px]";

  return (
    <>
      {/* title + top actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-medium">Catalog &amp; Inventory Management</h1>
        <div className="flex flex-wrap gap-2">
          <GreenBtn icon={Plus} onClick={() => setModal({ type: "book" })}>Add Book</GreenBtn>
          <GreenBtn icon={Plus} onClick={() => setModal({ type: "copy" })}>Add Copy</GreenBtn>
          <GreenBtn icon={Download} onClick={() => fileRef.current?.click()}>Import Catalog</GreenBtn>
          <GreenBtn icon={Upload} onClick={exportCsv}>Export Catalog</GreenBtn>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importCsv(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      {/* search & filter */}
      <section className="rounded-xl border border-[#26382f] bg-[#131f19] p-4">
        <h2 className="mb-3 text-[14px] font-medium">Search and Filter</h2>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-[#2a3d33] bg-[#16231c] px-3">
            <Search className="h-4 w-4 text-[#9bb0a4]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, author, ISBN..."
              className="w-full bg-transparent text-[13px] text-white placeholder-[#7f948a] outline-none"
            />
          </div>
          {filterKeys.map((k) => (
            <FilterSelect key={k} label={k} value={filters[k]} onChange={setFilter(k)} options={options[k]} />
          ))}
        </div>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c.key} className="flex items-center gap-1.5 rounded-md border border-[#2a3d33] bg-[#16231c] px-2.5 py-1 text-[12px]">
                {c.label}
                <button onClick={() => setFilter(c.key)("")} aria-label={`Remove ${c.label}`}>
                  <X className="h-3 w-3 text-[#9bb0a4] hover:text-white" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* table */}
      <section className="mt-4 overflow-hidden rounded-xl border border-[#26382f] bg-[#131f19]">
        <div className="overflow-x-auto">
          <div className="min-w-[1040px]">
            <div className={`grid ${cols} items-center gap-3 bg-[#182a21] px-4 py-3 text-[13px] text-[#e3ece6]`}>
              <span>Cover</span>
              <span className="leading-tight">Book Details<br />Title &amp; Author</span>
              <span>ISBN</span>
              <span>Category</span>
              <span className="leading-tight">Total<br />Copies</span>
              <span className="leading-tight">Available<br />Copies</span>
              <span className="leading-tight">Damaged/<br />Lost</span>
              <span className="leading-tight">Status<br />Badges</span>
              <span>Actions</span>
            </div>

            {loading && <p className="px-4 py-8 text-sm text-[#9bb0a4]">Loading catalog...</p>}
            {!loading && rows.length === 0 && (
              <p className="px-4 py-8 text-sm text-[#9bb0a4]">
                {books.length === 0 ? "The catalog is empty. Add your first book." : "No books match your search."}
              </p>
            )}

            {rows.map((b) => (
              <div
                key={b.id}
                className={`grid ${cols} items-center gap-3 border-t border-[#26382f] px-4 py-3 text-[13px] ${
                  b.archived ? "opacity-60" : ""
                }`}
              >
                <div className={`h-[50px] w-[36px] rounded-[3px] bg-gradient-to-br shadow-md ${b.cover}`} />
                <div className="min-w-0 leading-snug">
                  <p className="truncate text-white">{b.title}</p>
                  <p className="truncate text-[12px] text-[#9bb0a4]">{b.author}</p>
                </div>
                <span className="truncate">{b.isbn || "—"}</span>
                <span>{b.category || "—"}</span>
                <span>{b.total}</span>
                <span>{b.available}</span>
                <span>{b.damaged}</span>
                <span className={`w-fit rounded-full border px-2.5 py-0.5 text-[11px] ${badge[badgeOf(b)]}`}>
                  {badgeOf(b)}
                </span>

                <div className="flex items-center gap-3">
                  <button onClick={() => setModal({ type: "book", book: b })} className="flex items-center gap-1.5 text-[12px] text-[#cfdcd3] hover:text-white">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => setManageId(b.id)}
                    className="rounded-md bg-[#38D982] px-2.5 py-2 text-[12px] font-semibold leading-tight text-[#0D1512] hover:brightness-110"
                  >
                    Manage Copies
                  </button>

                  <div className="flex flex-col gap-1.5 text-[12px]">
                    <button onClick={() => toggleArchive(b)} className="flex items-center gap-1.5 text-[#cfdcd3] hover:text-white">
                      {b.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                      {b.archived ? "Restore" : "Archive"}
                    </button>
                    <button onClick={() => deleteBook(b)} className="flex items-center gap-1.5 text-[#f87171] hover:text-red-300">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Pager page={page} pages={pages} onChange={setPage} />
      </section>

      {manageBook && <CopyPanel book={manageBook} onClose={() => setManageId(null)} onChanged={load} />}

      {modal?.type === "book" && (
        <BookModal
          initial={modal.book}
          categories={options.Category}
          onClose={() => setModal(null)}
          onSave={saveBook}
        />
      )}
      {modal?.type === "copy" && (
        <AddCopyModal books={books.filter((b) => !b.archived)} onClose={() => setModal(null)} onSave={saveCopy} />
      )}
    </>
  );
}