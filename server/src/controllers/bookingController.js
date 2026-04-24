import { Booking } from "../models/Booking.js";
import { Property } from "../models/Property.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "../services/notificationService.js";
import { recordRefundDebitsAndCredits } from "../services/transactionService.js";

function nightsBetween(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export const createBooking = catchAsync(async (req, res) => {
  const { property: propertyId, checkIn, checkOut, guests = 1, notes = "" } = req.body;
  if (!propertyId || !checkIn || !checkOut) {
    throw new AppError("Property, check-in, and check-out are required", 400);
  }
  const property = await Property.findById(propertyId);
  if (!property || !property.isActive) {
    throw new AppError("Property not available", 400);
  }
  if (String(property.host) === String(req.user._id)) {
    throw new AppError("You cannot book your own listing", 400);
  }
  const cin = new Date(checkIn);
  const cout = new Date(checkOut);
  if (cin >= cout) {
    throw new AppError("Check-out must be after check-in", 400);
  }
  if (Number(guests) > property.maxGuests) {
    throw new AppError(`This stay allows up to ${property.maxGuests} guests`, 400);
  }
  const clash = await Booking.findOne({
    property: propertyId,
    status: { $in: ["pending", "confirmed"] },
    checkIn: { $lt: cout },
    checkOut: { $gt: cin },
  });
  if (clash) {
    throw new AppError("Those dates are no longer available", 400);
  }
  const nights = nightsBetween(cin, cout);
  const totalPrice = nights * property.pricePerNight;
  const booking = await Booking.create({
    property: propertyId,
    guest: req.user._id,
    host: property.host,
    checkIn: cin,
    checkOut: cout,
    guests: Number(guests),
    totalPrice,
    status: "pending",
    paymentStatus: "unpaid",
    notes: String(notes).slice(0, 2000),
  });
  await createNotification({
    userId: property.host,
    type: "booking",
    message: `New booking request for "${property.title}"`,
    link: "/dashboard/bookings",
  });
  const populated = await booking.populate("property", "title city images");
  res.status(201).json({ success: true, booking: populated });
});

export const myBookingsAsGuest = catchAsync(async (req, res) => {
  const list = await Booking.find({ guest: req.user._id })
    .sort({ createdAt: -1 })
    .populate("property", "title city images")
    .populate("host", "name");
  res.json({ success: true, bookings: list });
});

export const myBookingsAsHost = catchAsync(async (req, res) => {
  const list = await Booking.find({ host: req.user._id })
    .sort({ createdAt: -1 })
    .populate("property", "title city")
    .populate("guest", "name email avatar");
  res.json({ success: true, bookings: list });
});

export const confirmBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError("Booking not found", 404);
  if (String(booking.host) !== String(req.user._id) && req.user.role !== "admin") {
    throw new AppError("Only the host can confirm", 403);
  }
  if (booking.status === "cancelled") {
    throw new AppError("This booking is cancelled", 400);
  }
  if (booking.paymentStatus !== "mock_paid" && process.env.ALLOW_UNPAID_CONFIRM !== "true") {
    throw new AppError("The guest has not completed demo payment for this request yet", 400);
  }
  booking.status = "confirmed";
  await booking.save();
  await createNotification({
    userId: booking.guest,
    type: "booking",
    message: "Your stay has been confirmed by the host.",
    link: "/dashboard/trips",
  });
  res.json({ success: true, booking });
});

export const cancelBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError("Booking not found", 404);
  const isGuest = String(booking.guest) === String(req.user._id);
  const isHost = String(booking.host) === String(req.user._id);
  if (!isGuest && !isHost && req.user.role !== "admin") {
    throw new AppError("Not allowed", 403);
  }
  if (booking.status === "cancelled") {
    return res.json({ success: true, booking });
  }
  const wasPaid = booking.paymentStatus === "mock_paid";
  booking.status = "cancelled";
  if (wasPaid) {
    booking.paymentStatus = "refunded";
    await recordRefundDebitsAndCredits({
      guestId: booking.guest,
      hostId: booking.host,
      amount: booking.totalPrice,
      bookingId: booking._id,
    });
  } else {
    booking.paymentStatus = "unpaid";
  }
  await booking.save();
  const other = isGuest ? booking.host : booking.guest;
  await createNotification({
    userId: other,
    type: "booking",
    message: isGuest ? "A guest cancelled a booking." : "The host cancelled your booking.",
    link: "/dashboard",
  });
  res.json({ success: true, booking });
});

export const getBooking = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("property")
    .populate("guest", "name email")
    .populate("host", "name email");
  if (!booking) throw new AppError("Booking not found", 404);
  const isGuest = String(booking.guest?._id) === String(req.user._id);
  const isHost = String(booking.host?._id) === String(req.user._id);
  if (!isGuest && !isHost && req.user.role !== "admin") {
    throw new AppError("Not allowed", 403);
  }
  res.json({ success: true, booking });
});
