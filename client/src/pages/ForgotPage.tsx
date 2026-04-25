import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/ToastHost";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell } from "@/components/layout/AuthShell";

export function ForgotPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"request" | "reset">("request");
  const [busy, setBusy] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const toast = useToast();

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post<{
        resetToken?: string;
        note?: string;
        message: string;
      }>("/auth/forgotPassword", { email });
      if (data.resetToken) {
        setDevToken(data.resetToken);
        setMode("reset");
        toast("Check dev output — reset token is available in development", "ok");
      } else {
        toast(data.message, "ok");
        setMode("reset");
      }
    } catch (err) {
      const m = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Request failed", "err");
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const t = devToken || token;
    try {
      const { data } = await api.post("/auth/resetPassword", { token: t, password });
      toast(data.message, "ok");
      setMode("request");
    } catch (err) {
      const m = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Reset failed", "err");
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "request" ? "Reset access" : "Set new password";
  const subtitle =
    mode === "request"
      ? "We will issue a token. In dev, the token is returned in the response."
      : "Paste your token and choose a new password.";

  return (
    <AuthShell
      title={title}
      subtitle={subtitle}
      image="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80"
    >
      <AnimatePresence mode="wait">
        {mode === "request" && (
          <motion.form
            key="req"
            onSubmit={request}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
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
            <button className="btn-primary mt-5 w-full" type="submit" disabled={busy}>
              Request token
            </button>
          </motion.form>
        )}
        {mode === "reset" && (
          <motion.form
            key="reset"
            onSubmit={reset}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="ring-gradient glass mt-8 p-8 shadow-lift"
          >
            {devToken && <p className="mb-3 break-all text-xs text-ember/80">Dev token: {devToken}</p>}
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-200/85">
              Token
              <input
                className="input-ctrl"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste from email (or dev output)"
              />
            </label>
            <label className="mt-3 block text-xs font-medium uppercase tracking-wider text-ink-200/85">
              New password
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
            <button className="btn-primary mt-5 w-full" type="submit" disabled={busy}>
              Update password
            </button>
            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-white/10 py-2 text-sm text-ink-200 transition hover:border-white/20 hover:text-paper"
              onClick={() => {
                setMode("request");
              }}
            >
              Back
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      <p className="mt-6 text-center text-sm text-ink-200">
        <Link to="/login" className="text-ember transition hover:text-paper">
          ← Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
