import mongoose from "mongoose";
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: String,
    isbn: String,
    rating: { type: Number, default: 4 },
    shelf: String,
    cover: { type: String, default: "from-slate-900 to-emerald-700" },
    sub: String,
    total: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
    damaged: { type: Number, default: 0 },
    publisher: { type: String, default: "" },
    year: Number,
    archived: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default mongoose.model("Book", bookSchema);