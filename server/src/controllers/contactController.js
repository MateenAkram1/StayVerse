import { ContactMessage } from "../models/ContactMessage.js";
import { catchAsync } from "../utils/catchAsync.js";

export const contactSubmit = catchAsync(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message are required" });
  }
  await ContactMessage.create({ name, email, message: String(message).slice(0, 5000) });
  res.status(201).json({ success: true, message: "Thanks — we received your message." });
});
