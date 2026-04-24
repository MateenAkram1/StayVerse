import crypto from "crypto";
import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

export const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }
  const allowed = role && ["guest", "host"].includes(role) ? role : "guest";
  const user = await User.create({ name, email, password, role: allowed });
  const token = signToken(user._id);
  res.status(201).json({ success: true, token, user: user.toJSON() });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }
  const token = signToken(user._id);
  res.json({ success: true, token, user: user.toJSON() });
});

export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

export const patchPassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    throw new AppError("Current password and a new password (6+ chars) are required", 400);
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new AppError("User not found", 404);
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect", 400);
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password updated" });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError("Email is required", 400);
  }
  const found = await User.findOne({ email }).select("_id");
  if (!found) {
    return res.json({ success: true, message: "If that email is registered, reset instructions are available." });
  }
  const raw = crypto.randomBytes(32).toString("hex");
  await User.updateOne(
    { _id: found._id },
    {
      passwordResetToken: hashToken(raw),
      passwordResetExpire: new Date(Date.now() + 60 * 60 * 1000),
    }
  );

  const devHint =
    process.env.NODE_ENV === "development"
      ? { resetToken: raw, note: "Development only: use PATCH /api/auth/resetPassword with this token" }
      : {};
  if (process.env.NODE_ENV === "development") {
    logger("Password reset token (dev only)", raw);
  }
  res.json({
    success: true,
    message: "If that email is registered, you can complete reset with a valid token.",
    ...devHint,
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) {
    throw new AppError("Token and new password (6+ chars) are required", 400);
  }
  const hashed = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpire: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpire");
  if (!user) {
    throw new AppError("Token invalid or expired", 400);
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  res.json({ success: true, message: "Password has been reset. You can sign in now." });
});
