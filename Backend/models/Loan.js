import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  borrowedAt: { type: Date, default: Date.now },
  due: { type: Date, required: true },
  renewals: { type: Number, default: 0 },
  returnedAt: { type: Date, default: null },
});

export default mongoose.model("Loan", loanSchema);