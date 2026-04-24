import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
  if (err.name === "ValidationError") {
    const first = Object.values(err.errors || {})[0];
    return res.status(400).json({ success: false, message: first?.message || "Validation failed" });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: "Duplicate value — that record already exists" });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  logger("Unhandled error", err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
}
