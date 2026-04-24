import { Property } from "../models/Property.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { Booking } from "../models/Booking.js";

export const listProperties = catchAsync(async (req, res) => {
  const {
    q,
    city,
    minPrice,
    maxPrice,
    type,
    checkIn,
    checkOut,
    minGuests,
    page = 1,
    limit = 12,
  } = req.query;
  const filter = { isActive: true };
  if (type) {
    filter.type = type;
  }
  if (city) {
    filter.city = new RegExp(city, "i");
  }
  if (minPrice != null) filter.pricePerNight = { ...filter.pricePerNight, $gte: Number(minPrice) };
  if (maxPrice != null) {
    filter.pricePerNight = { ...filter.pricePerNight, $lte: Number(maxPrice) };
  }
  if (minGuests) {
    filter.maxGuests = { $gte: Number(minGuests) };
  }
  if (q) {
    filter.$or = [
      { title: new RegExp(String(q), "i") },
      { description: new RegExp(String(q), "i") },
      { address: new RegExp(String(q), "i") },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  let properties = await Property.find(filter)
    .populate("host", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  if (checkIn && checkOut) {
    const cin = new Date(checkIn);
    const cout = new Date(checkOut);
    const taken = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
      checkIn: { $lt: cout },
      checkOut: { $gt: cin },
    }).select("property");
    const block = new Set(taken.map((b) => String(b.property)));
    properties = properties.filter((p) => !block.has(String(p._id)) && p.isAvailable !== false);
  }
  const total = await Property.countDocuments(filter);
  res.json({ success: true, properties, total, page: Number(page), limit: Number(limit) });
});

export const getProperty = catchAsync(async (req, res) => {
  const p = await Property.findById(req.params.id).populate("host", "name bio avatar social");
  if (!p) throw new AppError("Property not found", 404);
  res.json({ success: true, property: p });
});

export const createProperty = catchAsync(async (req, res) => {
  if (req.user.role === "guest") {
    throw new AppError("Switch to a host account to add listings", 403);
  }
  const data = { ...req.body, host: req.user._id };
  if (typeof data.amenities === "string") {
    data.amenities = data.amenities.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (data.location) {
    data.location = {
      lat: Number(data.location.lat),
      lng: Number(data.location.lng),
    };
  }
  if (data.images) {
    data.images = Array.isArray(data.images) ? data.images : [data.images];
  }
  const property = await Property.create(data);
  res.status(201).json({ success: true, property });
});

export const updateProperty = catchAsync(async (req, res) => {
  const p = await Property.findById(req.params.id);
  if (!p) throw new AppError("Property not found", 404);
  if (String(p.host) !== String(req.user._id) && req.user.role !== "admin") {
    throw new AppError("Not allowed to edit this listing", 403);
  }
  const body = { ...req.body };
  delete body.host;
  if (body.amenities && typeof body.amenities === "string") {
    body.amenities = body.amenities.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (body.location) {
    body.location = {
      lat: Number(body.location.lat),
      lng: Number(body.location.lng),
    };
  }
  const updated = await Property.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  res.json({ success: true, property: updated });
});

export const deleteProperty = catchAsync(async (req, res) => {
  const p = await Property.findById(req.params.id);
  if (!p) throw new AppError("Property not found", 404);
  if (String(p.host) !== String(req.user._id) && req.user.role !== "admin") {
    throw new AppError("Not allowed to delete this listing", 403);
  }
  await p.deleteOne();
  res.json({ success: true, message: "Listing removed" });
});

export const myProperties = catchAsync(async (req, res) => {
  const list = await Property.find({ host: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, properties: list });
});

export const addPropertyImages = catchAsync(async (req, res) => {
  const p = await Property.findById(req.params.id);
  if (!p) throw new AppError("Property not found", 404);
  if (String(p.host) !== String(req.user._id) && req.user.role !== "admin") {
    throw new AppError("Not allowed", 403);
  }
  if (!req.files?.length) {
    throw new AppError("Upload at least one image", 400);
  }
  const paths = req.files.map((f) => `/uploads/${f.filename}`);
  p.images = [...(p.images || []), ...paths].slice(0, 20);
  await p.save();
  res.json({ success: true, property: p });
});
