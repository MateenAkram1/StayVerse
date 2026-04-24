import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { Booking } from "../models/Booking.js";

export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

export const updateProfile = catchAsync(async (req, res) => {
  const allowed = ["name", "phone", "bio", "locationCity", "social", "preferences"];
  const body = { ...req.body };
  for (const k of Object.keys(body)) {
    if (!allowed.includes(k)) delete body[k];
  }
  if (body.preferences) {
    body.preferences = {
      maxPrice: Number(body.preferences.maxPrice) || 500,
      propertyTypes: Array.isArray(body.preferences.propertyTypes) ? body.preferences.propertyTypes : [],
    };
  }
  const user = await User.findByIdAndUpdate(req.user._id, body, { new: true, runValidators: true });
  res.json({ success: true, user });
});

export const getBookingHistory = catchAsync(async (req, res) => {
  const asGuest = await Booking.find({ guest: req.user._id })
    .sort({ createdAt: -1 })
    .populate("property", "title city images pricePerNight");
  res.json({ success: true, bookings: asGuest });
});

export const setAvatarUrl = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError("Image file is required", 400);
  }
  const rel = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: rel },
    { new: true }
  );
  res.json({ success: true, user });
});

export const setRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  if (!["guest", "host"].includes(role)) {
    throw new AppError("Role must be guest or host", 400);
  }
  const user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true });
  res.json({ success: true, user });
});

export const listUsers = catchAsync(async (_req, res) => {
  const users = await User.find().select("name email role createdAt");
  res.json({ success: true, users });
});
