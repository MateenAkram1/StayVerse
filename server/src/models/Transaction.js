import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    kind: { type: String, enum: ["debit", "credit"], required: true },
    category: { type: String, default: "booking" },
    label: { type: String, required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  },
  { timestamps: true }
);

transactionSchema.index({ createdAt: -1, user: 1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
