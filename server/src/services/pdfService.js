import PDFDocument from "pdfkit";
import { Booking } from "../models/Booking.js";
import { Property } from "../models/Property.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export function buildBookingReceiptPdf(booking, property, guest, host) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("StayVerse — reservation receipt", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#444").text(`Ref: ${String(booking._id)}`, { align: "center" });
    doc.moveDown(1.2);
    doc.fillColor("#000").fontSize(12);

    const fmt = (d) => new Date(d).toLocaleString();

    doc.text(`Guest: ${guest.name} (${guest.email})`);
    doc.text(`Host: ${host.name} (${host.email})`);
    doc.moveDown(0.6);
    doc.text(`Property: ${property.title}`);
    doc.text(`Address: ${property.address}, ${property.city}`);
    doc.moveDown(0.6);
    doc.text(`Check-in: ${fmt(booking.checkIn)}`);
    doc.text(`Check-out: ${fmt(booking.checkOut)}`);
    doc.text(`Guests: ${booking.guests}`);
    doc.text(`Status: ${booking.status}`);
    doc.text(`Payment: ${booking.paymentStatus}`);
    doc.moveDown(0.8);
    doc.fontSize(14).text(`Total: $${Number(booking.totalPrice).toFixed(2)}`, { continued: false });
    doc.moveDown(1.2);
    doc.fontSize(9).fillColor("#666").text("This document was generated in demo mode. Not a tax invoice.");
    doc.end();
  });
}

export async function getBookingReceiptBufferForUser({ bookingId, userId, role }) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }
  const isGuest = String(booking.guest) === String(userId);
  const isHost = String(booking.host) === String(userId);
  if (!isGuest && !isHost && role !== "admin") {
    throw new AppError("Not allowed to download this receipt", 403);
  }
  const [property, guest, host] = await Promise.all([
    Property.findById(booking.property),
    User.findById(booking.guest),
    User.findById(booking.host),
  ]);
  if (!property || !guest || !host) {
    throw new AppError("Missing related data for PDF", 500);
  }
  const buffer = await buildBookingReceiptPdf(booking, property, guest, host);
  return { buffer, fileName: `stayverse-receipt-${String(booking._id).slice(-8)}.pdf` };
}
