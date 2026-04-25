import { chatStayVerse } from "../services/geminiService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const chat = catchAsync(async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length > 25) {
    throw new AppError("Send an array messages (max 25 turns)", 400);
  }
  const { reply, error, model } = await chatStayVerse({ messages });
  if (error && !reply) {
    return res.json({ success: false, message: error, reply: null, model: null });
  }
  res.json({ success: true, reply, model, warning: error });
});
