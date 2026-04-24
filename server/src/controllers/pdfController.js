import { getBookingReceiptBufferForUser } from "../services/pdfService.js";
import { catchAsync } from "../utils/catchAsync.js";

export const downloadReceipt = catchAsync(async (req, res) => {
  const { buffer, fileName } = await getBookingReceiptBufferForUser({
    bookingId: req.params.id,
    userId: req.user._id,
    role: req.user.role,
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(buffer);
});
