import { Property } from "../models/Property.js";
import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import { rankPropertyIdsForUser } from "../services/geminiService.js";

export const forYou = catchAsync(async (req, res) => {
  if (!req.user) {
    const pool = await Property.find({ isActive: true })
      .sort({ pricePerNight: 1, createdAt: -1 })
      .limit(8)
      .select("_id title city type pricePerNight maxGuests");
    return res.json({ success: true, propertyIds: pool.map((p) => p._id), source: "guest_pool" });
  }
  const user = await User.findById(req.user._id);
  const userSummary = `Name ${user.name}; city ${user.locationCity || "n/a"}; max price $${user.preferences?.maxPrice || 500}; types ${(user.preferences?.propertyTypes || []).join(", ")}.`;

  const propertySummaries = await Property.find({ isActive: true })
    .select("_id city type pricePerNight maxGuests")
    .limit(40);
  if (!propertySummaries.length) {
    return res.json({ success: true, propertyIds: [], source: "empty" });
  }
  const { ids, source } = await rankPropertyIdsForUser({
    userSummary,
    propertySummaries,
    apiKey: process.env.GEMINI_API_KEY,
  });
  res.json({ success: true, propertyIds: ids, source });
});
