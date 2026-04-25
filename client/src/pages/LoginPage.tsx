import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "@/api/client";
import { setCredentials, setHydrated } from "@/features/auth/authSlice";
import type { User } from "@/types";
import { motion } from "framer-motion";
import { useToast } from "@/components/ToastHost";
import { AuthShell } from "@/components/layout/AuthShell";

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
    <AuthShell
      title="Sign in"
      subtitle="Welcome back — pick up where you left off."
      image="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80"
    >
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="ring-gradient glass mt-8 p-8 shadow-lift"
      >
        <label className="block text-xs font-medium uppercase tracking-wider text-ink-200/85">
          Email
          <input
            className="input-ctrl"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-ink-200/85">
          Password
          <input
            className="input-ctrl"
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
          <Link to="/forgot" className="text-ember transition hover:text-paper">
            Forgot password
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink-200">
          New here?{" "}
          <Link to="/register" className="text-ember transition hover:text-paper">
            Create an account
          </Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}
