import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "@/api/client";
import { setCredentials, setHydrated } from "@/features/auth/authSlice";
import type { User } from "@/types";
import { motion } from "framer-motion";
import { useToast } from "@/components/ToastHost";

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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800/70 p-8 shadow-lift"
      >
        <h1 className="font-display text-2xl text-paper">Create account</h1>
        <p className="mt-1 text-sm text-ink-200">Guests book trips; hosts manage listings.</p>
        <label className="mt-6 block text-xs uppercase tracking-wider text-ink-200/80">
          Name
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="mt-4 block text-xs uppercase tracking-wider text-ink-200/80">
          Email
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mt-4 block text-xs uppercase tracking-wider text-ink-200/80">
          Password (6+ characters)
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider text-ink-200/80">I want to</p>
          <div className="mt-2 flex gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-200">
              <input type="radio" name="r" checked={role === "guest"} onChange={() => setRole("guest")} />
              Travel
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-200">
              <input type="radio" name="r" checked={role === "host"} onChange={() => setRole("host")} />
              Host
            </label>
          </div>
        </div>
        <button className="btn-primary mt-6 w-full" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Join StayVerse"}
        </button>
        <p className="mt-4 text-center text-sm text-ink-200">
          Have an account?{" "}
          <Link to="/login" className="text-ember hover:underline">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
