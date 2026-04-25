import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { setUser } from "@/features/auth/authSlice";
import { api } from "@/api/client";
import { PaymentWizard, type SimSession } from "@/components/PaymentWizard";
import { useToast } from "@/components/ToastHost";

export function PayBookingPage() {
  const { bookingId } = useParams();
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [session, setSession] = useState<SimSession | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const syncUser = async () => {
    const { data } = await api.get<{ user: import("@/types").User }>("/auth/me");
    dispatch(setUser(data.user));
  };

  useEffect(() => {
    if (!bookingId) return;
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.post<{ session: SimSession }>("/payments/simulate/start", {
          purpose: "booking",
          bookingId,
        });
        setSession(data.session);
      } catch (e) {
        const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
        setErr(m || "Could not start checkout");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [bookingId]);

  if (loading) {
    return <p className="text-ink-200">Preparing secure checkout…</p>;
  }
  if (err) {
    return (
      <div className="space-y-2">
        <p className="text-red-300/90">{err}</p>
        <Link to="/dashboard/trips" className="text-ember hover:underline">
          Back to trips
        </Link>
      </div>
    );
  }
  if (!session) {
    return null;
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="font-display text-2xl text-paper">Checkout</h1>
      <p className="text-sm text-ink-200">
        Simulated card payment. For this booking, the total is charged from your <strong className="text-ink-100">wallet
        balance</strong> at the final step — add credits in{" "}
        <Link to="/dashboard/wallet" className="text-ember hover:underline">
          Wallet
        </Link>{" "}
        first if needed.
      </p>
      <PaymentWizard
        session={session}
        onComplete={async () => {
          await syncUser();
          toast("Payment completed", "ok");
          nav("/dashboard/trips");
        }}
      />
    </div>
  );
}
