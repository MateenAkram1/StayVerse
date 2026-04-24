import { Notification } from "../models/Notification.js";

export async function createNotification({ userId, type = "info", message, link = "" }) {
  return Notification.create({ user: userId, type, message, link });
}
