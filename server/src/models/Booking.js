import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, default: 1, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "mock_pending", "mock_paid", "refunded"], default: "unpaid" },
    mockPayReference: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

bookingSchema.index({ checkIn: 1, checkOut: 1, property: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
