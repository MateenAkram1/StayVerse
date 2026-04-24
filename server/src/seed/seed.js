import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const _d = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(_d, "../../.env") });
dotenv.config({ path: path.join(_d, "../../../.env") });
dotenv.config({ path: path.join(_d, "../../.env.local") });
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Property } from "../models/Property.js";
import { Blog } from "../models/Blog.js";

const cities = [
  { city: "Lahore", country: "Pakistan", lat: 31.52, lng: 74.35 },
  { city: "Islamabad", country: "Pakistan", lat: 33.68, lng: 73.04 },
  { city: "Karachi", country: "Pakistan", lat: 24.86, lng: 67.0 },
  { city: "Dubai", country: "UAE", lat: 25.2, lng: 55.27 },
];

async function run() {
  await connectDB();
  await User.deleteMany({ email: { $in: ["admin@stayverse.app", "host@stayverse.app", "guest@stayverse.app"] } });
  await Property.deleteMany({ address: { $regex: "Seed" } });
  await Blog.deleteMany({ title: { $regex: "StayVerse" } });

  const admin = await User.create({
    name: "StayVerse Admin",
    email: "admin@stayverse.app",
    password: "admin123",
    role: "admin",
    bio: "Platform administrator",
  });
  const host = await User.create({
    name: "Demo Host",
    email: "host@stayverse.app",
    password: "host1234",
    role: "host",
    bio: "Local host for semester demos",
    locationCity: "Lahore",
  });
  await User.create({
    name: "Demo Guest",
    email: "guest@stayverse.app",
    password: "guest123",
    role: "guest",
    locationCity: "Lahore",
  });

  for (let i = 0; i < cities.length; i += 1) {
    const c = cities[i];
    // eslint-disable-next-line no-await-in-loop
    await Property.create({
      host: host._id,
      title: `Seeded ${c.city} stay — light-filled apartment`,
      description:
        "Designed for a calm stay. Fast Wi‑Fi, full kitchen, and easy access to city highlights. (Seed data)",
      type: i % 2 ? "villa" : "entire",
      address: `Seed St 1${i} — near downtown`,
      city: c.city,
      country: c.country,
      location: { lat: c.lat + 0.01 * i, lng: c.lng - 0.01 * i },
      pricePerNight: 40 + i * 15,
      maxGuests: 2 + (i % 3),
      bedrooms: 1 + (i % 2),
      bathrooms: 1,
      amenities: ["wifi", "kitchen", "parking", "heating"],
      images: [`https://picsum.photos/seed/sv${i}/800/600`],
    });
  }

  await Blog.create({
    title: "StayVerse: travel notes from our first beta week",
    slug: "stayverse-travel-notes-beta",
    excerpt: "How we think about trust, place, and short stays.",
    content:
      "## Welcome\n\nThis is a sample article created by the **seed** script. You can add Markdown-style emphasis in the UI, or use plain text for coursework.\n\n- Hosts set clear house rules\n- Guests respect quiet hours",
    category: "Product",
    author: admin._id,
    published: true,
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete. Accounts:\n  admin@stayverse.app / admin123\n  host@stayverse.app / host1234\n  guest@stayverse.app / guest123");
  process.exit(0);
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
