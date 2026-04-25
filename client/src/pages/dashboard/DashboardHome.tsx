import { Link } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { motion } from "framer-motion";

const cards = [
  { to: "/dashboard/wallet", t: "Wallet", d: "Add simulated credits, then pay for stays (see checkout on each trip)." },
  { to: "/dashboard/trips", t: "Trips", d: "Bookings you’ve made as a guest." },
  { to: "/dashboard/cashflow", t: "Cashflow", d: "Credits and debits from wallet and bookings." },
  { to: "/dashboard/profile", t: "Profile", d: "Bio, photo, and travel preferences." },
  { to: "/dashboard/listings", t: "Listings", d: "Host tools — only when your account is in host mode.", host: true },
  { to: "/dashboard/analytics", t: "Performance", d: "Host metrics for your properties.", host: true },
  { to: "/dashboard/my-blog", t: "Journal", d: "Write travel content for the public blog.", host: true },
];

export function DashboardHome() {
  const user = useAppSelector((s) => s.auth.user);
  const items = cards.filter((c) => !c.host || user?.role === "host" || user?.role === "admin");

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Overview</h1>
      <p className="mt-1 text-sm text-ink-200">
        Role: <span className="text-ink-100">{user?.role}</span> — switch between guest and host in profile.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((c, i) => (
          <motion.div
            key={c.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={c.to}
              className="panel block h-full p-5 transition duration-200 hover:-translate-y-0.5 hover:border-ember/20 hover:shadow-lift"
            >
              <h2 className="font-display text-lg text-paper">{c.t}</h2>
              <p className="mt-2 text-sm text-ink-200">{c.d}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
