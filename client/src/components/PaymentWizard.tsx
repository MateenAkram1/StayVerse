import { useState } from "react";
import { api } from "@/api/client";

export type SimSession = {
  id: string;
  purpose: "wallet_topup" | "booking";
  amount: number;
  step: number;
  status: string;
  mockReference: string;
};

type Props = {
  session: SimSession;
  onComplete: (data?: { walletBalance?: number }) => void;
};

const TEST_HINT =
  "Simulated gateway: use test card ending in 4242 (Visa test). Any name works. No real money is charged.";

export function PaymentWizard({ session: initial, onComplete }: Props) {
  const [session, setSession] = useState(initial);
  const [name, setName] = useState("Test Guest");
  const [last4, setLast4] = useState("4242");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showCard, setShowCard] = useState(false);

  const refresh = async (id: string) => {
    const { data } = await api.get<{ session: SimSession }>(`/payments/simulate/${id}`);
    setSession(data.session);
    return data.session;
  };

  const run = async (fn: () => Promise<void>) => {
    setErr("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setErr(m || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  if (session.status === "captured") {
    return (
      <div className="panel space-y-2 p-4 text-sm text-ink-100/95">
        <p className="font-medium text-paper">Payment complete</p>
        <p className="text-ink-200">Reference: {session.mockReference}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {err && <p className="text-red-300/90">{err}</p>}

      <div className="panel space-y-2 p-4">
        <p className="text-xs uppercase tracking-wider text-ink-200/80">Step 1 — Review</p>
        <p className="text-ink-100/95">
          {session.purpose === "wallet_topup" ? "Add credits to your wallet" : "Pay for a booking"}{" "}
          <span className="font-semibold text-ember">${Number(session.amount).toFixed(2)}</span>{" "}
          <span className="text-ink-200/90">(simulated USD)</span>
        </p>
        <p className="text-xs text-ink-200/80">{TEST_HINT}</p>
        <p className="text-xs text-ink-200/50">Ref: {session.mockReference}</p>
      </div>

      {session.status === "pending" && !showCard && (
        <button type="button" className="btn-primary w-full" onClick={() => setShowCard(true)} disabled={busy}>
          Continue to card
        </button>
      )}

      {session.status === "pending" && showCard && (
        <div className="panel space-y-2 p-4">
          <p className="text-xs uppercase tracking-wider text-ink-200/80">Step 2 — Card (simulated)</p>
          <input
            className="w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2"
            placeholder="Name on card"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2"
            placeholder="Last 4 digits (4242 for test)"
            value={last4}
            maxLength={4}
            onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
          <button
            type="button"
            className="btn-primary w-full"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await api.post(`/payments/simulate/${session.id}/card`, { cardholderName: name, last4 });
                await refresh(session.id);
              })
            }
          >
            {busy ? "Authorizing…" : "Authorize card"}
          </button>
        </div>
      )}

      {session.status === "card_ok" && (
        <div className="panel space-y-2 p-4">
          <p className="text-xs uppercase tracking-wider text-ink-200/80">Step 3 — 3-D Secure (simulated)</p>
          <p className="text-ink-200">Your bank would show a challenge here. Approve to continue.</p>
          <button
            type="button"
            className="btn-primary w-full"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await api.post(`/payments/simulate/${session.id}/3ds`, {});
                await refresh(session.id);
              })
            }
          >
            {busy ? "…" : "Approve 3-D Secure"}
          </button>
        </div>
      )}

      {session.status === "three_ds_ok" && (
        <div className="panel space-y-2 p-4">
          <p className="text-xs uppercase tracking-wider text-ink-200/80">Step 4 — Capture</p>
          <p className="text-ink-200">Finalizes the simulated payment (wallet top-up or booking charge from wallet).</p>
          <button
            type="button"
            className="btn-primary w-full"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const { data } = await api.post<{
                  walletBalance?: number;
                }>(`/payments/simulate/${session.id}/capture`, {});
                const next = await refresh(session.id);
                if (next.status === "captured") {
                  onComplete({ walletBalance: data.walletBalance });
                }
              })
            }
          >
            {busy ? "Processing…" : "Complete payment"}
          </button>
        </div>
      )}
    </div>
  );
}
