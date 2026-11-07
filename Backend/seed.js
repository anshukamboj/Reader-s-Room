import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Book from "./models/Book.js";
import User from "./models/User.js";
import Loan from "./models/Loan.js";
import Reservation from "./models/Reservation.js";

const books = [
  { title: "The Hidden Forest", author: "Nature Gemas", category: "Nature", isbn: "9781234567890", rating: 4.8, shelf: "A-14", cover: "from-emerald-900 to-green-600", sub: "NATURE", total: 4, available: 2 },
  { title: "A History of History", author: "Axther Beyar", category: "History", isbn: "9789876543210", rating: 4.7, shelf: "B-12", cover: "from-amber-800 to-yellow-600", sub: "THE HISTORY", total: 2, available: 0 },
  { title: "Nature's Echo", author: "Mira Solen", category: "Nature", isbn: "9781122334455", rating: 4.6, shelf: "A-09", cover: "from-teal-900 to-emerald-500", sub: "ECHO", total: 2, available: 0 },
  { title: "Science Therapy", author: "Science", category: "Science", isbn: "9785544332211", rating: 4.9, shelf: "C-10", cover: "from-indigo-950 to-blue-600", sub: "SCIENCE", total: 5, available: 4 },
  { title: "River Notes", author: "Same Bothor", category: "Nature", isbn: "9784455667788", rating: 4.0, shelf: "A-11", cover: "from-slate-900 to-cyan-700", sub: "RIVER", total: 2, available: 1 },
  { title: "Science Atlas", author: "Eodle Gonon", category: "Science", isbn: "9783322110099", rating: 4.2, shelf: "C-04", cover: "from-slate-900 to-sky-700", sub: "ATLAS", total: 3, available: 3 },
  { title: "Old Maps", author: "Asther Beyar", category: "History", isbn: "9789900112233", rating: 4.6, shelf: "E-03", cover: "from-yellow-900 to-amber-600", sub: "MAPS", total: 2, available: 2 },
  { title: "The Last Orchard", author: "Mira Solen", category: "Fiction", isbn: "9781010101010", rating: 4.5, shelf: "F-02", cover: "from-orange-900 to-amber-500", sub: "ORCHARD", total: 3, available: 3 },
  { title: "Letters from Kyoto", author: "Hana Mori", category: "Fiction", isbn: "9783030303030", rating: 4.7, shelf: "F-07", cover: "from-rose-950 to-orange-700", sub: "KYOTO", total: 1, available: 1 },
  { title: "Garden of Salt", author: "Tomas Reyes", category: "Fiction", isbn: "9784040404040", rating: 4.1, shelf: "F-11", cover: "from-stone-800 to-stone-500", sub: "SALT", total: 1, available: 0 },
];

await mongoose.connect(process.env.MONGO_URI);

await Promise.all([Book.deleteMany(), Loan.deleteMany(), Reservation.deleteMany(), User.deleteMany()]);
await Book.insertMany(books);

const hash = (p) => bcrypt.hash(p, 10);
await User.create([
  { name: "Marcus Librarian", email: "marcus@library.org", password: await hash("librarian123"), role: "librarian" },
  { name: "Alexander Mercer", email: "alexander@example.com", password: await hash("password123"), memberId: "MEM-99201" },
]);

console.log("Seeded. Librarian: marcus@library.org / librarian123  |  Member: alexander@example.com / password123");
console.log("Database:", mongoose.connection.name, "| books:", await Book.countDocuments(), "| users:", await User.countDocuments());
await mongoose.disconnect();