import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "@/api/client";
import { setCredentials, setHydrated } from "@/features/auth/authSlice";
import type { User } from "@/types";
import { motion } from "framer-motion";
import { useToast } from "@/components/ToastHost";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
      dispatch(setCredentials({ token: data.token, user: data.user }));
      dispatch(setHydrated());
      nav("/dashboard");
    } catch (err) {
      const m = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Login failed", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800/70 p-8 shadow-lift"
      >
        <h1 className="font-display text-2xl text-paper">Sign in</h1>
        <p className="mt-1 text-sm text-ink-200">Welcome back to StayVerse.</p>
        <label className="mt-6 block text-xs uppercase tracking-wider text-ink-200/80">
          Email
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="mt-4 block text-xs uppercase tracking-wider text-ink-200/80">
          Password
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button className="btn-primary mt-6 w-full" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-center text-sm text-ink-200">
          <Link to="/forgot" className="text-ember hover:underline">
            Forgot password
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink-200">
          New here?{" "}
          <Link to="/register" className="text-ember hover:underline">
            Create an account
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
