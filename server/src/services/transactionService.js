import { Transaction } from "../models/Transaction.js";

export async function recordGuestDebit({ userId, amount, label, bookingId }) {
  if (!userId || amount == null) return;
  return Transaction.create({
    user: userId,
    amount: Math.abs(amount),
    kind: "debit",
    label,
    category: "booking",
    booking: bookingId,
  });
}

export async function recordHostCredit({ userId, amount, label, bookingId }) {
  if (!userId || amount == null) return;
  return Transaction.create({
    user: userId,
    amount: Math.abs(amount),
    kind: "credit",
    label,
    category: "booking",
    booking: bookingId,
  });
}

export async function recordRefundDebitsAndCredits({ guestId, hostId, amount, bookingId }) {
  if (amount == null) return;
  const a = Math.abs(amount);
  await Promise.all([
    guestId
      ? Transaction.create({
          user: guestId,
          amount: a,
          kind: "credit",
          label: "Refund for cancelled stay",
          category: "refund",
          booking: bookingId,
        })
      : null,
    hostId
      ? Transaction.create({
          user: hostId,
          amount: a,
          kind: "debit",
          label: "Reversal — cancelled booking",
          category: "refund",
          booking: bookingId,
        })
      : null,
  ]);
}
