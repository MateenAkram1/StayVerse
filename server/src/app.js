import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import { protect, optionalAuth } from "./middleware/auth.js";
import { upload } from "./middleware/upload.js";
import { restrictTo } from "./middleware/auth.js";

import * as auth from "./controllers/authController.js";
import * as users from "./controllers/userController.js";
import * as properties from "./controllers/propertyController.js";
import * as bookings from "./controllers/bookingController.js";
import * as blog from "./controllers/blogController.js";
import * as notif from "./controllers/notificationController.js";
import * as analytics from "./controllers/analyticsController.js";
import * as recommend from "./controllers/recommendationController.js";
import * as contact from "./controllers/contactController.js";
import * as payment from "./controllers/paymentController.js";
import * as cash from "./controllers/cashflowController.js";
import * as pdf from "./controllers/pdfController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "1.5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 400, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
app.use("/api", apiLimiter);

// Auth
app.post("/api/auth/register", authLimiter, auth.register);
app.post("/api/auth/login", authLimiter, auth.login);
app.get("/api/auth/me", protect, auth.getMe);
app.patch("/api/auth/password", protect, auth.patchPassword);
app.post("/api/auth/forgotPassword", authLimiter, auth.forgotPassword);
app.post("/api/auth/resetPassword", authLimiter, auth.resetPassword);

// Users
app.get("/api/users/profile", protect, users.getProfile);
app.patch("/api/users/profile", protect, users.updateProfile);
app.post("/api/users/avatar", protect, upload.single("image"), users.setAvatarUrl);
app.get("/api/users/trips", protect, users.getBookingHistory);
app.patch("/api/users/role", protect, users.setRole);
app.get("/api/admin/users", protect, restrictTo("admin"), users.listUsers);

// Properties
app.get("/api/properties", properties.listProperties);
app.get("/api/properties/mine", protect, properties.myProperties);
app.get("/api/properties/:id", properties.getProperty);
app.post("/api/properties", protect, properties.createProperty);
app.patch("/api/properties/:id", protect, properties.updateProperty);
app.delete("/api/properties/:id", protect, properties.deleteProperty);
app.post(
  "/api/properties/:id/images",
  protect,
  upload.array("images", 8),
  properties.addPropertyImages
);

// Bookings
app.post("/api/bookings", protect, bookings.createBooking);
app.get("/api/bookings/mine", protect, bookings.myBookingsAsGuest);
app.get("/api/bookings/host", protect, bookings.myBookingsAsHost);
app.get("/api/bookings/:id", protect, bookings.getBooking);
app.patch("/api/bookings/:id/confirm", protect, bookings.confirmBooking);
app.patch("/api/bookings/:id/cancel", protect, bookings.cancelBooking);

// Payments (demo)
app.post("/api/payments/demo", protect, payment.demoPay);

// PDF
app.get("/api/bookings/:id/receipt", protect, pdf.downloadReceipt);

// Cashflow
app.get("/api/cashflow", protect, cash.myCashflow);

// Recommendations
app.get("/api/recommendations", optionalAuth, recommend.forYou);

// Analytics
app.get("/api/analytics/host", protect, analytics.hostAnalytics);
app.get("/api/analytics/platform", protect, restrictTo("admin"), analytics.adminStats);

// Blog
app.get("/api/blog", blog.listBlogs);
app.get("/api/blog/categories", blog.allCategories);
app.get("/api/blog/mine", protect, blog.myBlogs);
app.get("/api/blog/:id", optionalAuth, blog.getBlog);
app.post("/api/blog", protect, blog.createBlog);
app.patch("/api/blog/:id", protect, blog.updateBlog);
app.delete("/api/blog/:id", protect, blog.deleteBlog);

// Notifications
app.get("/api/notifications", protect, notif.listMy);
app.patch("/api/notifications/:id/read", protect, notif.markRead);
app.post("/api/notifications/read-all", protect, notif.markAllRead);

// Contact
app.post("/api/contact", contact.contactSubmit);

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "StayVerse", time: new Date().toISOString() });
});

app.get("/api/version", (_req, res) => {
  res.json({ version: "1.0.0" });
});

app.use(errorHandler);

export default app;
