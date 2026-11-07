import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { Badge, Cover, Empty, PageTitle } from "../components/ui";
import { bookById, fmt, ord, useLib } from "../context/LibraryContext";

export default function Reservations() {
  const { reservations, cancelReservation, pickUp } = useLib();

  const cancel = (id) => {
    if (window.confirm(`Cancel your reservation for "${bookById(id).title}"?`)) cancelReservation(id);
  };

  return (
    <div>
      <PageTitle title="Reservations" subtitle={`${reservations.length} active reservation(s)`} />

      {reservations.length === 0 ? (
        <Empty icon={Bookmark} title="No active reservations" text="Reserve an unavailable book and we'll hold it for you.">
          <Link to="/dashboard/browse-books" className="btn btn-primary">Browse books</Link>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {reservations.map((r) => {
            const b = bookById(r.bookId), ready = r.status === "ready";
            return (
              <li key={r.bookId} className="flex flex-col gap-4 rounded-xl border line bg-card p-4 sm:flex-row sm:items-center">
                <Cover book={b} className="h-[96px] w-[64px]" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{b.title}</h3>
                  <p className="text-sm muted">By {b.author}</p>
                  <div className="mt-2">{ready ? <Badge>Ready for Pickup</Badge> : <Badge tone="warn">Stand: {ord(r.position)} in queue</Badge>}</div>
                  <p className="mt-2 text-xs muted">
                    {ready ? `Pick it up at shelf ${b.shelf}. Held until ${fmt(r.heldUntil)}.` : `Estimated wait: about ${r.position * 7} days.`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {ready && <button onClick={() => pickUp(r.bookId)} className="btn btn-primary btn-sm">Pick up & Borrow</button>}
                  <button onClick={() => cancel(r.bookId)} className="btn btn-danger btn-sm">Cancel Reservation</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}