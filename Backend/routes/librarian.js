
import express from "express";
import Book from "../models/Book.js";
import Loan from "../models/Loan.js";
import User from "../models/User.js";
import Reservation from "../models/Reservation.js";

const router = express.Router();

const fmtDate = (d, opts) =>
  d ? new Date(d).toLocaleDateString("en-US", opts) : "—";

const short = { month: "short", day: "numeric" };
const long = { month: "short", day: "numeric", year: "numeric" };
const monthYear = { month: "short", year: "numeric" };
const DAY = 24 * 60 * 60 * 1000;

router.get("/dashboard", async (req, res, next) => {
  try {
    const now = new Date();

    const dayRanges = Array.from({ length: 6 }, (_, i) => {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (5 - i));

      return {
        start,
        end: new Date(start.getTime() + DAY),
      };
    });

    const [
      totalTitles,
      copiesAgg,
      activeLoans,
      members,
      overdueLoans,
      pendingReservations,
      overdueDocs,
      resDocs,
      txDocs,
      lowBook,
      borrow,
      ret,
    ] = await Promise.all([
      Book.countDocuments(),

      Book.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),

      Loan.countDocuments({ returnedAt: null }),

      User.countDocuments({ role: "member" }),

      Loan.countDocuments({
        returnedAt: null,
        due: { $lt: now },
      }),

      Reservation.countDocuments({
        status: { $in: ["queued", "ready"] },
      }),

      Loan.find({
        returnedAt: null,
        due: { $lt: now },
      })
        .sort({ due: 1 })
        .limit(9)
        .populate("user", "name avatar")
        .populate("book", "title"),

      Reservation.find({
  status: { $in: ["queued", "ready"] },
})
  .sort({ createdAt: 1 })
  .limit(4)
  .populate("user", "name avatar")
  .populate("book", "title"),

      Loan.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("user", "name avatar"),

      Book.findOne({ available: { $lte: 1 } }).sort({
        available: 1,
      }),

      Promise.all(
        dayRanges.map((r) =>
          Loan.countDocuments({
            createdAt: { $gte: r.start, $lt: r.end },
          })
        )
      ),

      Promise.all(
        dayRanges.map((r) =>
          Loan.countDocuments({
            returnedAt: { $gte: r.start, $lt: r.end },
          })
        )
      ),
    ]);

    res.json({
     user: {
  name: req.user?.name || "Librarian",
  role: "Librarian",
  avatar: req.user?.avatar || "",
},

      today: fmtDate(now, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),

      stats: {
        totalTitles,
        physicalCopies: copiesAgg[0]?.total ?? 0,
        activeLoans,
        members,
        overdueLoans,
        pendingReservations,
      },

      overdue: overdueDocs.map((l) => {
        const days = Math.max(1, Math.floor((now - l.due) / DAY));

        return {
          id: l.id,
         avatar: r.user?.avatar,
name: r.user?.name || "Unknown",
          book: l.book?.title || "Unknown",
          due: fmtDate(l.due, short),
          days,
          action: days >= 30 ? "Mark Lost" : "Send Notice",
        };
      }),

      reservations: resDocs.map((r, i) => {
        const member = {
          avatar: r.member?.avatar,
          name: r.member?.name || "Unknown",
          role: "Member",
        };

        return i === 0
          ? {
              id: r.id,
              kind: "first",
              title: r.book?.title || "Unknown",
              sub: "Queue",
              members: [member],
              date: fmtDate(r.createdAt, long),
              badge: "#FBBF24",
            }
          : {
              id: r.id,
              kind: "action",
              title: r.book?.title || "Unknown",
              members: [member],
              priority: i + 1,
            };
      }),

      transactions: txDocs.map((l) => ({
        id: l.id,
        avatar: l.user?.avatar,
        name: l.user?.name || "Unknown",
        note: "Checked Out",
        date: fmtDate(l.due, monthYear),
        status: l.returnedAt ? "Returned" : "Checked Out",
      })),

      activity: {
        days: dayRanges.map((r) =>
          r.start.toLocaleDateString("en-US", {
            weekday: "short",
          })
        ),
        borrow,
        return: ret,
      },

      lowStock: lowBook
        ? {
            title: lowBook.title,
            copies: lowBook.available,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
