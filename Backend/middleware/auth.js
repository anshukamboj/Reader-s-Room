import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const protect = async (req, res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not logged in." });

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User no longer exists." });
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please log in again." });
  }
};

export const librarianOnly = (req, res, next) =>
  req.user.role === "librarian" ? next() : res.status(403).json({ message: "Librarians only." });
export const memberOnly = (req, res, next) =>
  req.user.role === "member" ? next() : res.status(403).json({ message: "Members only." });