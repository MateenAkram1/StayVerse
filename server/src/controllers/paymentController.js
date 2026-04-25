import { nanoid } from "nanoid";
import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { recordGuestDebit, recordHostCredit } from "../services/transactionService.js";
import { createNotification } from "../services/notificationService.js";

/**
 * One-tap pay from **wallet balance** only (no card simulation here).
 * Prefer the multi-step `/api/payments/simulate/*` flow in the UI.
 */
export const demoPay = catchAsync(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) {
    throw new AppError("bookingId is required", 400);
  }
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }
  if (String(booking.guest) !== String(req.user._id)) {
    throw new AppError("Only the guest can pay for this booking", 403);
  }
  if (booking.status === "cancelled") {
    throw new AppError("Cannot pay for a cancelled booking", 400);
  }
  if (booking.paymentStatus === "mock_paid" || booking.paymentStatus === "refunded") {
    return res.json({ success: true, booking, message: "Payment already recorded" });
  }
  const amount = booking.totalPrice;
  const userAfter = await User.findOneAndUpdate(
    { _id: req.user._id, walletBalance: { $gte: amount } },
    { $inc: { walletBalance: -amount } },
    { new: true }
  );
  if (!userAfter) {
    throw new AppError(
      `Not enough wallet balance. Add at least $${amount} in Dashboard → Wallet, or use the full checkout flow.`,
      400
    );
  }
  booking.paymentStatus = "mock_paid";
  booking.mockPayReference = `WALLET-QUICK-${nanoid(8)}`;
  await booking.save();

  await recordGuestDebit({
    userId: booking.guest,
    amount: booking.totalPrice,
    label: `Payment (wallet quick) #${String(booking._id).slice(-6)}`,
    bookingId: booking._id,
  });
  await recordHostCredit({
    userId: booking.host,
    amount: booking.totalPrice,
    label: `Earning — booking #${String(booking._id).slice(-6)}`,
    bookingId: booking._id,
  });
  await createNotification({
    userId: booking.host,
    type: "payment",
    message: "Wallet payment received for a new booking. You can confirm the reservation.",
    link: "/dashboard/bookings",
  });
  res.json({
    success: true,
    booking,
    walletBalance: userAfter.walletBalance,
    message: "Paid from your StayVerse wallet (simulated).",
  });
});
