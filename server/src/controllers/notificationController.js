import { Notification } from "../models/Notification.js";
import { catchAsync } from "../utils/catchAsync.js";

export const listMy = catchAsync(async (req, res) => {
  const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, notifications: list });
});

export const markRead = catchAsync(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  res.json({ success: true, notification: n });
});

export const markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});
