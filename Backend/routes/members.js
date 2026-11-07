import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Loan from "../models/Loan.js";
import Reservation from "../models/Reservation.js";
import { protect, librarianOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect, librarianOnly);

const DAY = 86400000;

const shape = (u, loans = 0) => ({
  id: u.id,
  name: u.name,
  memberId: u.memberId,
  email: u.email,
  phone: u.phone || "",
  type: u.membershipType,
  status: u.status,
  fines: u.fines,
  joined: u.createdAt.toISOString().slice(0, 10),
  loans,
});

router.get("/", async (req, res) => {
  const [users, counts] = await Promise.all([
    User.find({ role: "member" }).select("-password").sort({ createdAt: 1 }),
    Loan.aggregate([{ $match: { returnedAt: null } }, { $group: { _id: "$user", n: { $sum: 1 } } }]),
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json(users.map((u) => shape(u, map.get(u.id) || 0)));
});

router.post("/", async (req, res) => {
  const { name, email, password, type, phone } = req.body;
  if (!name?.trim() || !email?.trim() || !password)
    return res.status(400).json({ message: "Name, email and password are required." });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ message: "This email is already registered." });

  const last = await User.findOne({ memberId: /^MEM-/ }).sort({ memberId: -1 });
  const next = last ? parseInt(last.memberId.slice(4), 10) + 1 : 99201;

  const u = await User.create({
    name: name.trim(),
    email,
    phone: phone || "",
    membershipType: type || "Primary",
    password: await bcrypt.hash(password, 10),
    memberId: `MEM-${next}`,
  });
  res.status(201).json(shape(u));
});

router.put("/:id", async (req, res) => {
  const { name, email, phone, type } = req.body;
  const u = await User.findOne({ _id: req.params.id, role: "member" });
  if (!u) return res.status(404).json({ message: "Member not found." });

  if (email && email.toLowerCase() !== u.email && (await User.findOne({ email: email.toLowerCase() })))
    return res.status(409).json({ message: "This email is already registered." });

  if (name?.trim()) u.name = name.trim();
  if (email) u.email = email;
  if (phone !== undefined) u.phone = phone;
  if (type) u.membershipType = type;
  await u.save();
  res.json(shape(u));
});

router.patch("/:id/status", async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, role: "member" });
  if (!u) return res.status(404).json({ message: "Member not found." });
  u.status = u.status === "Active" ? "Suspended" : "Active";
  await u.save();
  res.json({ status: u.status });
});

router.patch("/:id/fines", async (req, res) => {
  const fines = Math.round(Math.max(0, Number(req.body.fines) || 0) * 100) / 100;
  const u = await User.findOneAndUpdate({ _id: req.params.id, role: "member" }, { fines }, { new: true });
  if (!u) return res.status(404).json({ message: "Member not found." });
  res.json({ fines: u.fines });
});

router.get("/:id/details", async (req, res) => {
  const uid = req.params.id;
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [active, reservations, thisYear] = await Promise.all([
    Loan.find({ user: uid, returnedAt: null }).populate("book", "title"),
    Reservation.find({ user: uid }).populate("book", "title"),
    Loan.find({ user: uid, borrowedAt: { $gte: yearStart } }),
  ]);

  const returned = thisYear.filter((l) => l.returnedAt);
  const avgReturnDays = returned.length
    ? Math.round(returned.reduce((s, l) => s + (l.returnedAt - l.borrowedAt), 0) / returned.length / DAY)
    : null;

  res.json({
    loans: active.map((l) => ({ title: l.book?.title ?? "Unknown book", due: l.due })),
    reservations: reservations.map((r) => ({ title: r.book?.title ?? "Unknown book", status: r.status })),
    borrowedThisYear: thisYear.length,
    avgReturnDays,
  });
});

export default router;