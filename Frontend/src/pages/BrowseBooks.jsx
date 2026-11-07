import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX, X } from "lucide-react";
import { books, useLib } from "../context/LibraryContext";
import { BookAction, BookCard, Cover, Empty, PageTitle } from "../components/ui";

const categories = ["All", ...new Set(books.map((b) => b.category))];

export default function BrowseBooks() {
  const { stock, dark } = useLib();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [category, setCategory] = useState("All");
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [sort, setSort] = useState("title");
  const [open, setOpen] = useState(null);

  const s = q.trim().toLowerCase();
  const list = books
    .filter(
      (b) =>
        (!s || [b.title, b.author, b.category, b.isbn].some((x) => x.toLowerCase().includes(s))) &&
        (category === "All" || b.category === category) &&
        (!onlyAvail || stock[b.id] > 0)
    )
    .sort((a, b) => (sort === "title" ? a.title.localeCompare(b.title) : b.rating - a.rating));

  const clear = () => { setParams({}); setCategory("All"); setOnlyAvail(false); };

  return (
    <div>
      <PageTitle title="Browse Books" subtitle={`${list.length} book(s) found`} />

     <div className="mb-4 flex flex-wrap items-center gap-3">
  <select
  value={sort}
  onChange={(e) => setSort(e.target.value)}
  className="h-10 rounded-lg border line bg-card px-3 text-sm outline-none"
>
  <option value="title" style={{ backgroundColor: dark ? "#1B2B22" : "#FFFFFF", color: dark ? "#FFFFFF" : "#111111" }}>Sort: Title</option>
  <option value="rating" style={{ backgroundColor: dark ? "#1B2B22" : "#FFFFFF", color: dark ? "#FFFFFF" : "#111111" }}>Sort: Top rated</option>
</select>
  <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border line bg-card px-3 text-sm">
    <input type="checkbox" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)} className="h-4 w-4 accent-[#48C77D]" /> Available only
  </label>
</div>

      <div className="mb-5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`rounded-full border px-3.5 py-1.5 text-sm ${category === c ? "border-[#48C77D] bg-[#285A3B] text-white" : "line hover-bg"}`}>{c}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty icon={SearchX} title="No books match your filters" text="Try a different search or clear the filters.">
          <button onClick={clear} className="btn btn-primary">Clear filters</button>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {list.map((b) => (
            <BookCard key={b.id} book={b}>
              <button onClick={() => setOpen(b)} className="btn btn-sm hover-bg flex-1">View Details</button>
              <BookAction book={b} className="flex-1" />
            </BookCard>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button aria-label="Close" onClick={() => setOpen(null)} className="absolute inset-0 bg-black/60" />
        <div className="relative w-full max-w-md rounded-xl border line bg-white p-5 shadow-2xl">
            <button onClick={() => setOpen(null)} aria-label="Close" className="absolute right-3 top-3"><X size={18} /></button>
            <div className="flex gap-4">
              <Cover book={open} className="h-[140px] w-[96px]" />
              <div className="min-w-0 text-sm muted">
                <h3 className="font-serif text-xl text-[inherit]" style={{ color: "var(--text)" }}>{open.title}</h3>
                <p>Author: {open.author}</p><p>Category: {open.category}</p>
                <p>ISBN: {open.isbn}</p><p>Shelf: {open.shelf}</p>
                <p>Copies available: {stock[open.id]}</p>
              </div>
            </div>
            <div className="mt-4"><BookAction book={open} className="w-full" /></div>
          </div>
        </div>
      )}
    </div>
  );
}