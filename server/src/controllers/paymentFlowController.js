import { nanoid } from "nanoid";
import { SimulatedPayment } from "../models/SimulatedPayment.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { recordGuestDebit, recordHostCredit, recordWalletTopUp } from "../services/transactionService.js";
import { createNotification } from "../services/notificationService.js";

const TEST_LAST4 = "4242";
const MS_HOUR = 60 * 60 * 1000;

function sessionPayload(doc) {
  return {
    id: doc._id,
    purpose: doc.purpose,
    amount: doc.amount,
    booking: doc.booking,
    step: doc.step,
    status: doc.status,
    mockReference: doc.mockReference,
    cardholderName: doc.cardholderName || "",
    testCardLast4: doc.testCardLast4 ? "****" : "",
    expiresAt: doc.expiresAt,
  };
}

/** Start simulated payment: wallet top-up or pay for a booking (from wallet at capture). */
export const startSimulated = catchAsync(async (req, res) => {
  const { purpose, amount, bookingId } = req.body;
  let amt;
  let bookingRef = null;

  if (purpose === "wallet_topup") {
    amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 1 || amt > 50000) {
      throw new AppError("Top-up amount must be between $1 and $50,000 (simulated)", 400);
    }
  } else if (purpose === "booking") {
    if (!bookingId) {
      throw new AppError("bookingId is required for booking payments", 400);
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }
    if (String(booking.guest) !== String(req.user._id)) {
      throw new AppError("Not your booking", 403);
    }
    if (booking.status === "cancelled") {
      throw new AppError("Booking is cancelled", 400);
    }
    if (booking.paymentStatus === "mock_paid") {
      throw new AppError("Already paid", 400);
    }
    amt = booking.totalPrice;
    bookingRef = booking._id;
  } else {
    throw new AppError("purpose must be wallet_topup or booking", 400);
  }

  const doc = await SimulatedPayment.create({
    user: req.user._id,
    purpose: purpose === "wallet_topup" ? "wallet_topup" : "booking",
    amount: amt,
    booking: bookingRef,
    step: 1,
    status: "pending",
    mockReference: `SIM-${nanoid(10)}`,
    expiresAt: new Date(Date.now() + MS_HOUR),
  });

  res.status(201).json({
    success: true,
    session: sessionPayload(doc),
    flow: [
      { step: 1, title: "Review", description: "Confirm amount and details" },
      { step: 2, title: "Card", description: `Use simulated test card ending in ${TEST_LAST4}` },
      { step: 3, title: "3-D Secure", description: "Approve the test challenge" },
      { step: 4, title: "Capture", description: "Finalize (adds credits or pays from wallet)" },
    ],
  });
});

export const getSession = catchAsync(async (req, res) => {
  const doc = await SimulatedPayment.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    throw new AppError("Session not found", 404);
  }
  if (doc.expiresAt < new Date()) {
    throw new AppError("Session expired — start again", 400);
  }
  res.json({ success: true, session: sessionPayload(doc) });
});

export const submitCard = catchAsync(async (req, res) => {
  const { cardholderName, last4 } = req.body;
  const doc = await SimulatedPayment.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    throw new AppError("Session not found", 404);
  }
  if (doc.expiresAt < new Date()) {
    throw new AppError("Session expired", 400);
  }
  if (doc.status === "captured") {
    throw new AppError("Already completed", 400);
  }
  const name = String(cardholderName || "").trim();
  if (name.length < 2) {
    throw new AppError("Enter the name on card", 400);
  }
  if (String(last4).trim() !== TEST_LAST4) {
    throw new AppError(`Simulated checkout only accepts test card ending in ${TEST_LAST4} (Visa test pattern).`, 400);
  }
  doc.cardholderName = name;
  doc.testCardLast4 = last4;
  doc.status = "card_ok";
  doc.step = 2;
  await doc.save();
  res.json({ success: true, session: sessionPayload(doc), message: "Card authorized (simulated)" });
});

export const submit3DS = catchAsync(async (req, res) => {
  const doc = await SimulatedPayment.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    throw new AppError("Session not found", 404);
  }
  if (doc.expiresAt < new Date()) {
    throw new AppError("Session expired", 400);
  }
  if (doc.status !== "card_ok") {
    throw new AppError("Complete the card step first", 400);
  }
  doc.status = "three_ds_ok";
  doc.step = 3;
  await doc.save();
  res.json({ success: true, session: sessionPayload(doc), message: "3-D Secure approved (simulated)" });
});

export const captureSession = catchAsync(async (req, res) => {
  const doc = await SimulatedPayment.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) {
    throw new AppError("Session not found", 404);
  }
  if (doc.expiresAt < new Date()) {
    throw new AppError("Session expired", 400);
  }
  if (doc.status === "captured") {
    return res.json({ success: true, message: "Already completed", session: sessionPayload(doc) });
  }
  if (doc.status !== "three_ds_ok") {
    throw new AppError("Approve 3-D Secure before capture", 400);
  }

  if (doc.purpose === "wallet_topup") {
    await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: doc.amount } });
    await recordWalletTopUp({
      userId: req.user._id,
      amount: doc.amount,
      label: `Wallet top-up (simulated) — ref ${doc.mockReference}`,
    });
    doc.status = "captured";
    doc.step = 4;
    await doc.save();
    const user = await User.findById(req.user._id).select("walletBalance");
    return res.json({
      success: true,
      message: "Credits added to your StayVerse wallet (simulated USD).",
      walletBalance: user.walletBalance,
      session: sessionPayload(doc),
    });
  }

  const booking = await Booking.findById(doc.booking);
  if (!booking) {
    throw new AppError("Booking missing", 404);
  }
  if (String(booking.guest) !== String(req.user._id)) {
    throw new AppError("Forbidden", 403);
  }
  const updated = await User.findOneAndUpdate(
    { _id: req.user._id, walletBalance: { $gte: doc.amount } },
    { $inc: { walletBalance: -doc.amount } },
    { new: true }
  );
  if (!updated) {
    throw new AppError(
      `Insufficient wallet balance. Add at least $${doc.amount} via Wallet top-up, then try again.`,
      400
    );
  }
  booking.paymentStatus = "mock_paid";
  booking.mockPayReference = `WALLET-PAY-${nanoid(10)}`;
  await booking.save();
  await recordGuestDebit({
    userId: booking.guest,
    amount: doc.amount,
    label: `Booking payment (wallet) #${String(booking._id).slice(-6)}`,
    bookingId: booking._id,
  });
  await recordHostCredit({
    userId: booking.host,
    amount: doc.amount,
    label: `Earning — booking #${String(booking._id).slice(-6)}`,
    bookingId: booking._id,
  });
  await createNotification({
    userId: booking.host,
    type: "payment",
    message: "Wallet payment received. You can confirm the reservation.",
    link: "/dashboard/bookings",
  });
  doc.status = "captured";
  doc.step = 4;
  await doc.save();
  return res.json({
    success: true,
    message: "Booking paid from wallet (simulated).",
    booking,
    walletBalance: updated.walletBalance,
    session: sessionPayload(doc),
  });
});
