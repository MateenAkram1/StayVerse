import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

type BannerItem = {
  match: (path: string) => boolean;
  title: string;
  description: string;
  image: string;
  cta?: { to: string; label: string };
  tag: string;
};

const PUBLIC_ITEMS: BannerItem[] = [
  {
    match: (p) => p === "/",
    title: "Find stays that fit your trip style",
    description: "Browse curated homes with clear pricing, strong photos, and fast booking decisions.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
    cta: { to: "/explore", label: "Explore stays" },
    tag: "Discover",
  },
  {
    match: (p) => p.startsWith("/explore"),
    title: "Filter by city, budget, and guest count",
    description: "A structured search surface designed for quick scan-and-compare decisions.",
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80",
    cta: { to: "/explore", label: "Refine search" },
    tag: "Search",
  },
  {
    match: (p) => p.startsWith("/stay/"),
    title: "Inspect details before booking",
    description: "Review amenities, dates, and price breakdowns with clarity before checkout.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
    tag: "Stay details",
  },
  {
    match: (p) => p.startsWith("/blog"),
    title: "Travel stories and hosting insights",
    description: "Editorial content to help guests plan and hosts improve listing quality.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
    cta: { to: "/blog", label: "Read journal" },
    tag: "Journal",
  },
  {
    match: (p) => p.startsWith("/contact"),
    title: "Contact and location context",
    description: "Direct messaging plus map coordinates to keep communication and logistics simple.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
    tag: "Support",
  },
];

const DASHBOARD_ITEMS: BannerItem[] = [
  {
    match: (p) => p === "/dashboard",
    title: "Your workspace for bookings and hosting",
    description: "Track trips, manage listings, and keep payment flow visibility in one place.",
    image: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1400&q=80",
    cta: { to: "/dashboard/trips", label: "Open trips" },
    tag: "Overview",
  },
  {
    match: (p) => p.includes("/wallet") || p.includes("/pay/") || p.includes("/trips"),
    title: "Wallet-powered payment operations",
    description: "Top up credits, run secure simulated checkout, and settle bookings confidently.",
    image: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?auto=format&fit=crop&w=1400&q=80",
    cta: { to: "/dashboard/wallet", label: "Manage wallet" },
    tag: "Payments",
  },
  {
    match: (p) => p.includes("/listings") || p.includes("/bookings"),
    title: "Host operations and inventory control",
    description: "Maintain listing quality, availability, and approval flow for incoming guests.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
    cta: { to: "/dashboard/listings", label: "Manage listings" },
    tag: "Hosting",
  },
  {
    match: (p) => p.includes("/analytics") || p.includes("/cashflow"),
    title: "Performance and financial visibility",
    description: "Understand occupancy trends, transaction movement, and operational health.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    cta: { to: "/dashboard/analytics", label: "View analytics" },
    tag: "Insights",
  },
  {
    match: (p) => p.includes("/notifications") || p.includes("/profile") || p.includes("/my-blog") || p.includes("/admin"),
    title: "Account, communication, and platform controls",
    description: "Keep profile, inbox, and publishing controls aligned with your role.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    tag: "Management",
  },
];

export function ContextBanner({ area }: { area: "public" | "dashboard" }) {
  const { pathname } = useLocation();
  const list = area === "public" ? PUBLIC_ITEMS : DASHBOARD_ITEMS;
  const item = list.find((i) => i.match(pathname));
  if (!item) return null;

  const reverse = pathname.length % 2 === 0;

  return (
    <section className="container-page pt-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className={`panel overflow-hidden p-4 md:p-5 ${reverse ? "md:[&>div]:grid-cols-[1.15fr_0.85fr]" : "md:[&>div]:grid-cols-[0.85fr_1.15fr]"}`}
      >
        <div className="grid items-stretch gap-4">
          <div className={`${reverse ? "md:order-2" : ""} flex flex-col justify-center`}>
            <span className="mb-2 inline-flex w-fit rounded-full border border-ember/40 bg-ember/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ember">
              {item.tag}
            </span>
            <h2 className="font-display text-2xl text-paper md:text-3xl">{item.title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-100/95">{item.description}</p>
            {item.cta && (
              <div className="mt-4">
                <Link className="btn-primary" to={item.cta.to}>
                  {item.cta.label}
                </Link>
              </div>
            )}
          </div>
          <div className={`${reverse ? "md:order-1" : ""}`}>
            <img
              src={item.image}
              alt={item.title}
              className="h-56 w-full rounded-2xl object-cover md:h-full"
              loading="lazy"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
