import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clsx } from "clsx";
import { clearAuth } from "@/features/auth/authSlice";

type Item = { to: string; label: string; host?: boolean; admin?: boolean };

const items: Item[] = [
  { to: "/dashboard", label: "Overview" },
  { to: "/dashboard/trips", label: "Trips" },
  { to: "/dashboard/cashflow", label: "Cashflow" },
  { to: "/dashboard/notifications", label: "Inbox" },
  { to: "/dashboard/listings", label: "Listings", host: true },
  { to: "/dashboard/bookings", label: "Guest requests", host: true },
  { to: "/dashboard/analytics", label: "Performance", host: true },
  { to: "/dashboard/my-blog", label: "Writing", host: true },
  { to: "/dashboard/admin", label: "Platform", admin: true },
  { to: "/dashboard/profile", label: "Profile" },
];

export function DashboardLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const loc = useLocation();
  const logout = () => {
    dispatch(clearAuth());
    navigate("/");
  };

  const visible = items.filter((i) => {
    if (i.admin) return user?.role === "admin";
    if (i.host) return user?.role === "host" || user?.role === "admin";
    return true;
  });

  return (
    <div className="flex min-h-screen">
      <aside
        className={clsx(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-white/5 bg-night/95 transition-[width] duration-300 ease-out md:relative",
          open ? "w-60" : "w-0 -translate-x-full overflow-hidden border-0 md:w-16 md:translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-4">
          <Link to="/" className="font-display text-paper">
            {open ? "StayVerse" : "S"}
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {visible.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.to === "/dashboard"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-pine-600/30 text-paper" : "text-ink-200 hover:bg-white/5 hover:text-paper"
                )
              }
            >
              {open ? i.label : i.label[0]}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/5 p-3 text-xs text-ink-200/70">
          {open && (
            <p className="line-clamp-2">
              Signed in as <span className="text-ink-100">{user?.name}</span>
            </p>
          )}
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-ink-800/70 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn-ghost !px-2 text-xs"
              aria-label="Toggle sidebar"
            >
              {open ? "◀" : "▶"}
            </button>
            <span className="text-sm text-ink-200/90">
              {items.find((x) => x.to === loc.pathname)?.label ?? "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/explore" className="text-sm text-ink-200 hover:text-paper">
              Browse places
            </Link>
            <button type="button" onClick={logout} className="btn-ghost !py-1.5 text-xs">
              Logout
            </button>
          </div>
        </header>
        <motion.div
          className="flex-1 p-4 sm:p-6 lg:p-8"
          key={loc.pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
