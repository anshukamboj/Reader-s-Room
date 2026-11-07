import { Router } from "express";
import Book from "../models/Book.js";
import Copy from "../models/Copy.js";
import Loan from "../models/Loan.js";
import Reservation from "../models/Reservation.js";
import { protect, librarianOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect);

// keep this list identical to COVER_CLASSES in the frontend LibraryContext.jsx
const covers = [
  "from-emerald-900 to-green-600", "from-amber-800 to-yellow-600", "from-teal-900 to-emerald-500",
  "from-indigo-950 to-blue-600", "from-slate-900 to-cyan-700", "from-slate-900 to-sky-700",
  "from-yellow-900 to-amber-600", "from-orange-900 to-amber-500", "from-rose-950 to-orange-700",
  "from-stone-800 to-stone-500",
];

const META = ["title", "author", "isbn", "category", "publisher", "shelf"];
const clean = (b = {}) => ({
  ...Object.fromEntries(META.map((k) => [k, String(b[k] ?? "").trim()])),
  year: b.year ? Number(b.year) : undefined,
});

// Available copies count toward "available"; Damaged and Lost count toward "damaged"
const key = (s) => (s === "Available" ? "available" : "damaged");

async function nextBarcodes(n) {
  const last = await Copy.findOne().sort({ barcode: -1 });
  let num = last ? parseInt(last.barcode.replace("LIB-", ""), 10) : 0;
  return Array.from({ length: n }, () => `LIB-${String(++num).padStart(5, "0")}`);
}

// books created before copies existed get their copy records on first view
async function ensureCopies(book) {
  const have = await Copy.countDocuments({ book: book._id });
  const need = book.total - have;
  if (need <= 0) return;
  const codes = await nextBarcodes(need);
  await Copy.insertMany(
    codes.map((barcode, i) => ({
      book: book._id,
      barcode,
      status: i < book.damaged ? "Damaged" : "Available",
      condition: i < book.damaged ? "Damaged" : "Good",
      location: book.shelf ? `Shelf ${book.shelf}` : "Intake Desk",
    }))
  );
}

async function createBook(data, copies) {
  const n = await Book.countDocuments();
  const book = await Book.create({
    ...data,
    cover: covers[n % covers.length],
    sub: data.title.split(" ")[0].toUpperCase().slice(0, 12),
    total: copies,
    available: copies,
    damaged: 0,
  });
  const codes = await nextBarcodes(copies);
  await Copy.insertMany(
    codes.map((barcode) => ({
      book: book._id,
      barcode,
      location: data.shelf ? `Shelf ${data.shelf}` : "Intake Desk",
    }))
  );
  return book;
}

// move one copy between the "available" and "damaged" counters (false = blocked)
async function move(bookId, from, to) {
  if (key(from) === key(to)) return true;
  const filter = { _id: bookId };
  if (from === "Available") filter.available = { $gt: 0 };
  const r = await Book.findOneAndUpdate(filter, { $inc: { [key(from)]: -1, [key(to)]: 1 } });
  return !!r;
}

/* ------------------------------- books ------------------------------ */

router.get("/", async (req, res) => {
  const filter = req.user.role === "librarian" ? {} : { archived: false };
  res.json(await Book.find(filter).sort({ createdAt: 1 }));
});

router.post("/", librarianOnly, async (req, res) => {
  const data = clean(req.body);
  if (!data.title || !data.author) return res.status(400).json({ message: "Title and author are required." });
  const copies = Math.max(1, parseInt(req.body.copies, 10) || 1);
  res.status(201).json(await createBook(data, copies));
});

router.post("/bulk", librarianOnly, async (req, res) => {
  const list = Array.isArray(req.body.books) ? req.body.books : [];
  let created = 0;
  let skipped = 0;
  for (const item of list) {
    const data = clean(item);
    if (!data.title || !data.author || (data.isbn && (await Book.exists({ isbn: data.isbn })))) {
      skipped++;
      continue;
    }
    await createBook(data, Math.max(1, parseInt(item.copies, 10) || 1));
    created++;
  }
  res.json({ created, skipped });
});

/* ------------------------------- copies ----------------------------- */

router.patch("/copies/:copyId", librarianOnly, async (req, res) => {
  const copy = await Copy.findById(req.params.copyId);
  if (!copy) return res.status(404).json({ message: "Copy not found." });

  const { status, condition, location } = req.body;
  if (status && status !== copy.status) {
    if (!(await move(copy.book, copy.status, status)))
      return res.status(400).json({ message: "All available copies are on loan, so none can be marked damaged or lost." });
    copy.status = status;
  }
  if (condition) copy.condition = condition;
  if (location !== undefined) copy.location = String(location).trim();
  await copy.save();
  res.json(copy);
});

router.delete("/copies/:copyId", librarianOnly, async (req, res) => {
  const copy = await Copy.findById(req.params.copyId);
  if (!copy) return res.status(404).json({ message: "Copy not found." });

  const ok =
    copy.status === "Available"
      ? await Book.findOneAndUpdate({ _id: copy.book, available: { $gt: 0 } }, { $inc: { total: -1, available: -1 } })
      : await Book.findOneAndUpdate({ _id: copy.book }, { $inc: { total: -1, damaged: -1 } });
  if (!ok) return res.status(400).json({ message: "All available copies are on loan, so none can be removed." });

  await copy.deleteOne();
  res.json({ message: "Copy removed." });
});

router.get("/:id/copies", librarianOnly, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found." });
  await ensureCopies(book);
  res.json(await Copy.find({ book: book._id }).sort({ barcode: 1 }));
});

router.post("/:id/copies", librarianOnly, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found." });
  await ensureCopies(book);

  const { condition = "Good", location } = req.body;
  const status = condition === "Damaged" ? "Damaged" : "Available";
  const [barcode] = await nextBarcodes(1);
  const copy = await Copy.create({
    book: book._id,
    barcode,
    condition,
    status,
    location: (location || "").trim() || (book.shelf ? `Shelf ${book.shelf}` : "Intake Desk"),
  });
  await Book.updateOne({ _id: book._id }, { $inc: { total: 1, [key(status)]: 1 } });
  res.status(201).json(copy);
});

/* --------------------------- single book ops ------------------------ */

router.put("/:id", librarianOnly, async (req, res) => {
  const data = clean(req.body);
  if (!data.title || !data.author) return res.status(400).json({ message: "Title and author are required." });
  const book = await Book.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!book) return res.status(404).json({ message: "Book not found." });
  res.json(book);
});

router.patch("/:id/archive", librarianOnly, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found." });
  book.archived = !book.archived;
  await book.save();
  res.json(book);
});

router.delete("/:id", librarianOnly, async (req, res) => {
  const [loans, reservations] = await Promise.all([
    Loan.countDocuments({ book: req.params.id, returnedAt: null }),
    Reservation.countDocuments({ book: req.params.id }),
  ]);
  if (loans || reservations)
    return res.status(400).json({
      message: `Can't delete: ${loans} active loan(s) and ${reservations} reservation(s). Archive it instead.`,
    });

  await Promise.all([Copy.deleteMany({ book: req.params.id }), Book.findByIdAndDelete(req.params.id)]);
  res.json({ message: "Book deleted." });
});

export default router;