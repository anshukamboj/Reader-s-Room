import { Router } from "express";
import Book from "../models/Book.js";
import Loan from "../models/Loan.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import { protect, memberOnly } from "../middleware/auth.js";

const router = Router();
const DAY = 86400000;

router.use(protect, memberOnly);
// everything the member pages need, in one call
router.get("/", protect, async (req, res) => {
  const uid = req.user.id;
  const [active, past, resv, me] = await Promise.all([
    Loan.find({ user: uid, returnedAt: null }).sort({ borrowedAt: 1 }),
    Loan.find({ user: uid, returnedAt: { $ne: null } }).sort({ returnedAt: -1 }),
    Reservation.find({ user: uid }).sort({ createdAt: 1 }),
    User.findById(uid).select("wishlist"),
  ]);

  const reservations = await Promise.all(
    resv.map(async (r) => ({
      bookId: String(r.book),
      status: r.status,
      heldUntil: r.heldUntil,
      position:
        r.status === "queued"
          ? await Reservation.countDocuments({ book: r.book, status: "queued", createdAt: { $lte: r.createdAt } })
          : undefined,
    }))
  );

  res.json({
    loans: active.map((l) => ({ bookId: String(l.book), borrowedAt: l.borrowedAt, due: l.due, renewals: l.renewals })),
    history: past.map((l) => ({ bookId: String(l.book), borrowedAt: l.borrowedAt, returnedAt: l.returnedAt })),
    reservations,
    wishlist: me.wishlist.map(String),
  });
});


router.post("/borrow/:id", protect, async (req, res) => {
  const count = await Loan.countDocuments({ user: req.user.id, returnedAt: null });
  if (count >= 5) return res.status(400).json({ message: "Borrow limit reached (5 books)." });

  const book = await Book.findOneAndUpdate(
    { _id: req.params.id, available: { $gt: 0 } },
    { $inc: { available: -1 } },
    { new: true }
  );
  if (!book) return res.status(400).json({ message: "No copies left. Try reserving it instead." });

  await Loan.create({ user: req.user.id, book: book._id, due: new Date(Date.now() + 14 * DAY) });
  res.json({ message: `Borrowed "${book.title}". Pick it up at shelf ${book.shelf}.` });
});

router.post("/renew/:id", protect, async (req, res) => {
  const loan = await Loan.findOne({ user: req.user.id, book: req.params.id, returnedAt: null });
  if (!loan) return res.status(404).json({ message: "Loan not found." });
  if (loan.due < new Date()) return res.status(400).json({ message: "Overdue books can't be renewed. Please return it." });
  if (loan.renewals >= 2) return res.status(400).json({ message: "This book has reached the renewal limit." });

  loan.due = new Date(loan.due.getTime() + 7 * DAY);
  loan.renewals += 1;
  await loan.save();
  res.json({ message: "Renewed for 7 more days." });
});

router.post("/return/:id", protect, async (req, res) => {
  const loan = await Loan.findOne({ user: req.user.id, book: req.params.id, returnedAt: null });
  if (!loan) return res.status(404).json({ message: "Loan not found." });

  loan.returnedAt = new Date();
  await loan.save();
  const book = await Book.findByIdAndUpdate(req.params.id, { $inc: { available: 1 } }, { new: true });
  res.json({ message: `Returned "${book.title}". Thank you!` });
});

router.post("/reserve/:id", protect, async (req, res) => {
  if (await Reservation.findOne({ user: req.user.id, book: req.params.id }))
    return res.status(400).json({ message: "You already reserved this book." });
  const book = await Book.findById(req.params.id);
  await Reservation.create({ user: req.user.id, book: book._id, status: "queued" });
  res.json({ message: `"${book.title}" reserved. We'll tell you when it's ready.` });
});

router.delete("/reserve/:id", protect, async (req, res) => {
  const r = await Reservation.findOneAndDelete({ user: req.user.id, book: req.params.id });
  if (r?.status === "ready") await Book.findByIdAndUpdate(req.params.id, { $inc: { available: 1 } });
  res.json({ message: "Reservation cancelled." });
});

router.post("/pickup/:id", protect, async (req, res) => {
  const r = await Reservation.findOneAndDelete({ user: req.user.id, book: req.params.id, status: "ready" });
  if (!r) return res.status(404).json({ message: "No ready reservation found." });
  const book = await Book.findById(req.params.id);
  await Loan.create({ user: req.user.id, book: book._id, due: new Date(Date.now() + 14 * DAY) });
  res.json({ message: `Borrowed "${book.title}". Enjoy your read!` });
});

router.post("/wishlist/:id", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  const has = user.wishlist.some((b) => String(b) === req.params.id);
  user.wishlist = has ? user.wishlist.filter((b) => String(b) !== req.params.id) : [...user.wishlist, req.params.id];
  await user.save();
  res.json({ message: has ? "Removed from wishlist." : "Added to wishlist." });
});

export default router;