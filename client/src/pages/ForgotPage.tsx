import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/ToastHost";
import { motion } from "framer-motion";

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

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {mode === "request" && (
        <motion.form
          onSubmit={request}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800/70 p-8"
        >
          <h1 className="font-display text-2xl text-paper">Reset access</h1>
          <p className="mt-1 text-sm text-ink-200">We will issue a token. In dev, the token is returned in the response.</p>
          <label className="mt-6 block text-xs text-ink-200/80">
            Email
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button className="btn-primary mt-5 w-full" type="submit" disabled={busy}>
            Request token
          </button>
        </motion.form>
      )}
      {mode === "reset" && (
        <motion.form
          onSubmit={reset}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800/70 p-8"
        >
          <h1 className="font-display text-2xl text-paper">Set new password</h1>
          {devToken && (
            <p className="mt-2 break-all text-xs text-ember/80">Dev token: {devToken}</p>
          )}
          <label className="mt-4 block text-xs text-ink-200/80">
            Token
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste from email (or dev output)"
            />
          </label>
          <label className="mt-3 block text-xs text-ink-200/80">
            New password
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
          <button className="btn-primary mt-5 w-full" type="submit" disabled={busy}>
            Update password
          </button>
          <button
            type="button"
            className="mt-2 w-full text-sm text-ink-200"
            onClick={() => {
              setMode("request");
            }}
          >
            Back
          </button>
        </motion.form>
      )}
      <p className="absolute bottom-8 text-sm text-ink-200/80">
        <Link to="/login" className="text-ember hover:underline">
          ← Sign in
        </Link>
      </p>
    </div>
  );
}
