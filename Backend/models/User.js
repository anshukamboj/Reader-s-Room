import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["member", "librarian"], default: "member" },
    memberId: String,
    phone: { type: String, default: "" },
    preferredName: { type: String, default: "" },
    membershipType: { type: String, enum: ["Primary", "Medium", "Premium"], default: "Primary" },
    status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
    fines: { type: Number, default: 0 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);