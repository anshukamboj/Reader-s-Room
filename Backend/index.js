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
const allowedOrigins = [
  "http://localhost:5173",
  "https://reader-s-room.onrender.com",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
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