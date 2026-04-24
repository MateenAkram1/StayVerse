import { nanoid } from "nanoid";
import { Booking } from "../models/Booking.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { recordGuestDebit, recordHostCredit } from "../services/transactionService.js";
import { createNotification } from "../services/notificationService.js";

/**
 * Free demo checkout — no real card, no payment processor keys required.
 * Simulates Payfast-style "paid" for coursework / portfolio use.
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
  booking.paymentStatus = "mock_paid";
  booking.mockPayReference = `DEMO-PAY-${nanoid(10)}`;
  await booking.save();

  await recordGuestDebit({
    userId: booking.guest,
    amount: booking.totalPrice,
    label: `Payment — booking #${String(booking._id).slice(-6)}`,
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
    message: "Demo payment received for a new booking. You can confirm the reservation.",
    link: "/dashboard/bookings",
  });
  res.json({ success: true, booking, message: "Demo payment successful (no real money was charged)" });
});
