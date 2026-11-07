import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import libraryRoutes from "./routes/library.js";
import librarianRoutes from "./routes/librarian.js";
import memberRoutes from "./routes/members.js";

const app = express();
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/librarian", librarianRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/members", memberRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

connectDB().then(() =>
  app.listen(process.env.PORT || 5000, () => console.log(`API running on port ${process.env.PORT || 5000}`))
);