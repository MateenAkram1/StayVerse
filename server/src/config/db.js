import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .envexample to .env in project root and configure MongoDB.");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  logger("MongoDB connected");
}
