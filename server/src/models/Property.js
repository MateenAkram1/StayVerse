import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 10000 },
    type: { type: String, enum: ["entire", "room", "shared", "villa", "cabin", "condo"], default: "entire" },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, default: "" },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    pricePerNight: { type: Number, required: true, min: 0 },
    maxGuests: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    amenities: [{ type: String }],
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    availableFrom: { type: Date, default: null },
    availableTo: { type: Date, default: null },
  },
  { timestamps: true }
);

propertySchema.index({ city: "text", title: "text", description: "text" });
propertySchema.index({ "location.lat": 1, "location.lng": 1 });

export const Property = mongoose.model("Property", propertySchema);
