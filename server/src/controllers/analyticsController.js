import { Booking } from "../models/Booking.js";
import { Property } from "../models/Property.js";
import { User } from "../models/User.js";
import { Blog } from "../models/Blog.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const hostAnalytics = catchAsync(async (req, res) => {
  if (req.user.role === "guest") {
    throw new AppError("Host or admin only", 403);
  }
  const myProps = await Property.find({ host: req.user._id }).select("_id");
  const ids = myProps.map((p) => p._id);
  const bookings = await Booking.find({ host: req.user._id, status: { $ne: "cancelled" } });
  const revenue = bookings
    .filter((b) => b.paymentStatus === "mock_paid" && b.status === "confirmed")
    .reduce((s, b) => s + b.totalPrice, 0);
  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  res.json({
    success: true,
    listings: ids.length,
    bookings: { total: bookings.length, pending, confirmed, cancelled: bookings.filter((b) => b.status === "cancelled").length },
    revenue: Math.round(revenue * 100) / 100,
  });
});

export const adminStats = catchAsync(async (_req, res) => {
  const [users, properties, bookings, blogs] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Booking.countDocuments(),
    Blog.countDocuments({ published: true }),
  ]);
  res.json({ success: true, stats: { users, properties, bookings, blogPosts: blogs } });
});
