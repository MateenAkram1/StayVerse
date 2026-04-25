import mongoose from "mongoose";

const simulatedPaymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, enum: ["wallet_topup", "booking"], required: true },
    amount: { type: Number, required: true, min: 0 },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    step: { type: Number, enum: [1, 2, 3, 4], default: 1 },
    status: { type: String, enum: ["pending", "card_ok", "three_ds_ok", "captured", "failed", "expired"], default: "pending" },
    cardholderName: { type: String, default: "" },
    testCardLast4: { type: String, default: "" },
    mockReference: { type: String, default: "" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const SimulatedPayment = mongoose.model("SimulatedPayment", simulatedPaymentSchema);
