import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

const secret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET not configured on server", 500);
  }
  return process.env.JWT_SECRET;
};

export const signToken = (id) =>
  jwt.sign({ id }, secret(), { expiresIn: process.env.JWT_EXPIRES || "7d" });

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("Not authenticated", 401));
  }
  const decoded = jwt.verify(token, secret());
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("User no longer exists", 401));
  }
  req.user = user;
  next();
});

export const optionalAuth = catchAsync(async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const decoded = jwt.verify(token, secret());
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch {
    // ignore
  }
  next();
});

export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("Forbidden for this account type", 403));
  }
  next();
};
