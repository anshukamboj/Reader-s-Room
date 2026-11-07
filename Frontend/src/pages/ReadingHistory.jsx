import { useState } from "react";
import { BookOpen, Clock, History, Tag } from "lucide-react";
import { bookById, fmt, useLib } from "../context/LibraryContext";
import { Empty, PageTitle, StatCard } from "../components/ui";

export default function ReadingHistory() {
  const { history, borrow } = useLib();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  const rows = history.map((h) => ({
    ...h, book: bookById(h.bookId),
    days: Math.max(1, Math.round((new Date(h.returnedAt) - new Date(h.borrowedAt)) / 86400000)),
  }));
  const cats = ["All", ...new Set(rows.map((r) => r.book.category))];
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.days, 0) / rows.length) : 0;
  const counts = {};
  rows.forEach((r) => (counts[r.book.category] = (counts[r.book.category] || 0) + 1));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const s = q.trim().toLowerCase();
  const shown = rows.filter((r) => (category === "All" || r.book.category === category) && (!s || (r.book.title + r.book.author).toLowerCase().includes(s)));

  return (
    <div>
      <PageTitle title="Reading History" subtitle="Everything you've borrowed and returned" />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Books read" value={rows.length} icon={BookOpen} />
        <StatCard label="Avg. days kept" value={avg} icon={Clock} />
        <StatCard label="Top category" value={top} icon={Tag} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history..." className="field !w-64" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="field !w-auto">
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {shown.length === 0 ? (
        <Empty icon={History} title="No history found" text="Books you return will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border line bg-card">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b line text-left text-xs muted">
                <th className="p-3 font-medium">Book</th><th className="p-3 font-medium">Borrowed</th>
                <th className="p-3 font-medium">Returned</th><th className="p-3 font-medium">Days</th><th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={i} className="border-b line last:border-0">
                  <td className="p-3"><p className="font-medium">{r.book.title}</p><p className="text-xs muted">{r.book.author} · {r.book.category}</p></td>
                  <td className="p-3">{fmt(r.borrowedAt)}</td>
                  <td className="p-3">{fmt(r.returnedAt)}</td>
                  <td className="p-3">{r.days}</td>
                  <td className="p-3 text-right"><button onClick={() => borrow(r.bookId)} className="btn btn-sm hover-bg">Borrow again</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}