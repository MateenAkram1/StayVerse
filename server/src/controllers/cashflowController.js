import { Transaction } from "../models/Transaction.js";
import { catchAsync } from "../utils/catchAsync.js";

export const myCashflow = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const q = { user: req.user._id };
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
  }
  const rows = await Transaction.find(q).sort({ createdAt: -1 }).limit(200);
  const totalCredit = rows.filter((r) => r.kind === "credit").reduce((s, r) => s + r.amount, 0);
  const totalDebit = rows.filter((r) => r.kind === "debit").reduce((s, r) => s + r.amount, 0);
  res.json({
    success: true,
    transactions: rows,
    summary: { totalCredit, totalDebit, net: totalCredit - totalDebit },
  });
});
