import mongoose from "mongoose";

const copySchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    barcode: { type: String, required: true, unique: true },
    condition: { type: String, enum: ["Good", "Worn", "Damaged"], default: "Good" },
    location: { type: String, default: "Intake Desk" },
    status: { type: String, enum: ["Available", "Damaged", "Lost"], default: "Available" },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default mongoose.model("Copy", copySchema);