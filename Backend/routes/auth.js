import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const publicUser = (u) => {
  const o = u.toJSON();
  delete o.password;
  return o;
};

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields are required." });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });

  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ message: "This email is already registered." });

  const count = await User.countDocuments();
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    memberId: `MEM-${99201 + count}`,
  });
  res.status(201).json({ message: "Account created.", user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ message: "Wrong email or password." });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: publicUser(user) });
});

router.get("/me", protect, (req, res) => res.json(publicUser(req.user)));

router.put("/me", protect, async (req, res) => {
  const { name, email, phone, preferredName } = req.body;
  Object.assign(req.user, { name, email, phone, preferredName });
  await req.user.save();
  res.json(publicUser(req.user));
});

router.put("/password", protect, async (req, res) => {
  const { current, next } = req.body;
  const user = await User.findById(req.user.id);
  if (!(await bcrypt.compare(current || "", user.password)))
    return res.status(400).json({ message: "Current password is wrong." });
  if (!next || next.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters." });
  user.password = await bcrypt.hash(next, 10);
  await user.save();
  res.json({ message: "Password updated." });
});

export default router;