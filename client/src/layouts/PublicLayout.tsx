import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clsx } from "clsx";
import { clearAuth } from "@/features/auth/authSlice";

const nav = [
  { to: "/explore", label: "Explore" },
  { to: "/blog", label: "Journal" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(clearAuth());
    navigate("/");
  };
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-night/75 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-paper">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ember text-xs text-paper shadow-lift">SV</span>
            <span className="group-hover:text-white">StayVerse</span>
          </Link>
          <nav className="flex items-center gap-0.5 overflow-x-auto sm:gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  clsx(
                    "shrink-0 rounded-md px-2.5 py-2 text-sm font-medium text-ink-200 transition hover:bg-white/5 hover:text-paper sm:px-3",
                    isActive && "bg-white/10 text-paper"
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn-ghost border-pine-400/30 !py-2 text-xs font-medium sm:text-sm"
                >
                  Dashboard
                </Link>
                <button type="button" onClick={logout} className="btn-ghost !py-2 text-xs font-medium sm:text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-ink-200 hover:text-paper">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary !py-2 text-sm">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <motion.main
        className="flex-1"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Outlet />
      </motion.main>
      <footer className="border-t border-white/10 py-10 text-ink-200">
        <div className="container-page grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-paper">StayVerse</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed">
              Short-term stays, built for coursework clarity — authentication, payments in demo mode, and maps without a paid map
              vendor lock-in.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-200/80">Product</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link className="hover:text-paper" to="/explore">
                  Explore
                </Link>
              </li>
              <li>
                <Link className="hover:text-paper" to="/blog">
                  Journal
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-200/80">Account</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link className="hover:text-paper" to="/register">
                  Create account
                </Link>
              </li>
              <li>
                <Link className="hover:text-paper" to="/dashboard">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-ink-200/60">© {new Date().getFullYear()} StayVerse. Academic project build.</p>
      </footer>
    </div>
  );
}
