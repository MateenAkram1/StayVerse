import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, LayoutGroup } from "framer-motion";
import { AnimatedOutlet } from "@/components/layout/AnimatedOutlet";
import { ContextBanner } from "@/components/layout/ContextBanner";
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
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-night/50 shadow-[0_4px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="group flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-paper"
          >
            <motion.span
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-ember to-amber-900/90 text-xs font-bold text-paper shadow-lift"
              whileHover={{ scale: 1.04, rotate: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              SV
            </motion.span>
            <span className="bg-gradient-to-r from-paper to-ink-200 bg-clip-text transition group-hover:text-white">
              StayVerse
            </span>
          </Link>
          <LayoutGroup>
          <nav className="flex items-center gap-0.5 overflow-x-auto sm:gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  clsx(
                    "nav-pill shrink-0 rounded-lg px-2.5 py-2 text-sm font-medium sm:px-3",
                    isActive ? "text-paper" : "text-ink-200 hover:bg-white/[0.06] hover:text-paper"
                  )
                }
              >
                {({ isActive }) => (
                  <span className="relative" data-active={isActive}>
                    {n.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-ember/80 to-pine-400/60"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          </LayoutGroup>
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
      <ContextBanner area="public" />
      <main className="relative flex-1">
        <AnimatedOutlet />
      </main>
      <footer className="relative border-t border-white/[0.08] bg-night/20 py-12 text-ink-200 backdrop-blur-sm">
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
