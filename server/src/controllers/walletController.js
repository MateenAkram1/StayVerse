import { User } from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getWallet = catchAsync(async (req, res) => {
  const u = await User.findById(req.user._id).select("walletBalance");
  res.json({
    success: true,
    balance: u?.walletBalance ?? 0,
    currency: "USD",
  });
});
