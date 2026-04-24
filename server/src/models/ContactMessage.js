import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true, maxlength: 5000 },
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.model("ContactMessage", contactSchema);
