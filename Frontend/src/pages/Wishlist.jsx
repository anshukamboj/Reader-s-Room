import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { BookAction, BookCard, Empty, PageTitle } from "../components/ui";
import { bookById, useLib } from "../context/LibraryContext";

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useLib();
  const saved = wishlist.map(bookById);

  return (
    <div>
      <PageTitle title="Wishlist" subtitle={`${saved.length} saved book(s)`} />

      {saved.length === 0 ? (
        <Empty icon={Heart} title="Your wishlist is empty" text="Tap the heart on any book to save it for later.">
          <Link to="/dashboard/browse-books" className="btn btn-primary">Browse books</Link>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {saved.map((b) => (
            <BookCard key={b.id} book={b}>
              <button onClick={() => toggleWishlist(b.id)} className="btn btn-danger btn-sm flex-1">Remove</button>
              <BookAction book={b} className="flex-1" />
            </BookCard>
          ))}
        </div>
      )}
    </div>
  );
}