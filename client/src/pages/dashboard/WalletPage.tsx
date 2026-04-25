import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setUser } from "@/features/auth/authSlice";
import { api } from "@/api/client";
import { PaymentWizard, type SimSession } from "@/components/PaymentWizard";
import { useToast } from "@/components/ToastHost";

export function WalletPage() {
  const u = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [amount, setAmount] = useState("25");
  const [session, setSession] = useState<SimSession | null>(null);
  const [err, setErr] = useState("");

  const syncUser = async () => {
    const { data } = await api.get<{ user: import("@/types").User }>("/auth/me");
    dispatch(setUser(data.user));
  };

  const start = async () => {
    setErr("");
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 1) {
      setErr("Enter a valid amount (min $1)");
      return;
    }
    try {
      const { data } = await api.post<{ session: SimSession }>("/payments/simulate/start", {
        purpose: "wallet_topup",
        amount: n,
      });
      setSession(data.session);
    } catch (e) {
      const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setErr(m || "Could not start");
    }
  };

  useEffect(() => {
    void syncUser();
  }, []);

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="font-display text-2xl text-paper">Wallet</h1>
      <p className="text-sm text-ink-200">
        Balance is in <strong className="text-ink-100">simulated USD</strong> for the demo. Top up with the test card
        flow, then pay for stays from your balance (or use the full booking checkout, which also debits the wallet on
        capture).
      </p>
      <p className="text-lg text-ember">
        ${Number((u as { walletBalance?: number })?.walletBalance ?? 0).toFixed(2)} <span className="text-sm text-ink-200">available</span>
      </p>

      {!session && (
        <div className="panel space-y-3 p-4">
          <label className="text-xs uppercase text-ink-200/80">
            Amount to add
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          {err && <p className="text-sm text-red-300/90">{err}</p>}
          <button type="button" className="btn-primary w-full" onClick={start}>
            Start secure top-up
          </button>
        </div>
      )}

      {session && (
        <PaymentWizard
          session={session}
          onComplete={async () => {
            await syncUser();
            setSession(null);
            toast("Wallet updated", "ok");
          }}
        />
      )}

      <p className="text-sm text-ink-200/80">
        <Link to="/dashboard/trips" className="text-ember hover:underline">
          Trips
        </Link>{" "}
        ·{" "}
        <Link to="/explore" className="text-ember hover:underline">
          Explore
        </Link>
      </p>
    </div>
  );
}
