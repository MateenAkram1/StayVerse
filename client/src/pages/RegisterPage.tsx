import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "@/api/client";
import { setCredentials, setHydrated } from "@/features/auth/authSlice";
import type { User } from "@/types";
import { motion } from "framer-motion";
import { useToast } from "@/components/ToastHost";
import { AuthShell } from "@/components/layout/AuthShell";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"guest" | "host">("guest");
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/register", { name, email, password, role });
      dispatch(setCredentials({ token: data.token, user: data.user }));
      dispatch(setHydrated());
      nav("/dashboard");
    } catch (err) {
      const m = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Registration failed", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Travel as a guest or list your space as a host — same polished flow."
      image="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    >
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="ring-gradient glass mt-8 p-8 shadow-lift"
      >
        <label className="block text-xs font-medium uppercase tracking-wider text-ink-200/85">
          Name
          <input
            className="input-ctrl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>
        <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-ink-200/85">
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
          Password (6+ characters)
          <input
            className="input-ctrl"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
          />
        </label>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-200/80">I want to</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                role === "guest" ? "border-ember/50 bg-ember/10 text-paper" : "border-white/10 text-ink-200 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="r"
                className="accent-ember"
                checked={role === "guest"}
                onChange={() => setRole("guest")}
              />
              Travel
            </label>
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                role === "host" ? "border-ember/50 bg-ember/10 text-paper" : "border-white/10 text-ink-200 hover:border-white/20"
              }`}
            >
              <input type="radio" name="r" className="accent-ember" checked={role === "host"} onChange={() => setRole("host")} />
              Host
            </label>
          </div>
        </div>
        <button className="btn-primary mt-6 w-full" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Join StayVerse"}
        </button>
        <p className="mt-4 text-center text-sm text-ink-200">
          Have an account?{" "}
          <Link to="/login" className="text-ember transition hover:text-paper">
            Sign in
          </Link>
        </p>
      </motion.form>
    </AuthShell>
  );
}
