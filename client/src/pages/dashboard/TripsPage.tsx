import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { api } from "@/api/client";
import type { Booking, Property } from "@/types";
import { useToast } from "@/components/ToastHost";

export function TripsPage() {
  const [list, setList] = useState<Booking[]>([]);
  const toast = useToast();

  const load = async () => {
    const { data } = await api.get("/bookings/mine");
    setList(data.bookings);
  };

  useEffect(() => {
    void load();
  }, []);

  const cancel = async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast("Booking cancelled", "ok");
      void load();
    } catch (e) {
      const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Failed", "err");
    }
  };

  const pay = async (id: string) => {
    try {
      await api.post("/payments/demo", { bookingId: id });
      toast("Demo payment recorded", "ok");
      void load();
    } catch (e) {
      const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Failed", "err");
    }
  };

  const pdf = async (id: string) => {
    try {
      const res = await api.get(`/bookings/${id}/receipt`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank");
    } catch {
      toast("Could not download PDF", "err");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Trips</h1>
      <p className="text-sm text-ink-200">
        Pay with the <strong className="text-ink-100">full checkout</strong> (simulated card) or <strong className="text-ink-100">quick pay</strong> if your{" "}
        <Link to="/dashboard/wallet" className="text-ember hover:underline">
          wallet
        </Link>{" "}
        has enough balance.
      </p>
      <div className="mt-6 space-y-3">
        {list.map((b) => {
          const p = b.property as Property;
          return (
            <div key={b._id} className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link to={`/stay/${typeof p === "object" ? p._id : p}`} className="font-medium text-paper hover:underline">
                  {typeof p === "object" ? p.title : "Property"}
                </Link>
                <p className="text-sm text-ink-200">
                  {format(new Date(b.checkIn), "MMM d")} – {format(new Date(b.checkOut), "MMM d")} · ${b.totalPrice} ·{" "}
                  {b.status} · {b.paymentStatus}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {b.paymentStatus !== "mock_paid" && b.status !== "cancelled" && (
                  <>
                    <Link to={`/dashboard/pay/${b._id}`} className="btn-primary !py-1.5 text-center text-xs">
                      Checkout
                    </Link>
                    <button type="button" className="btn-ghost !py-1.5 text-xs" onClick={() => pay(b._id)}>
                      Quick pay (wallet)
                    </button>
                  </>
                )}
                {b.status !== "cancelled" && (
                  <button type="button" className="btn-ghost !py-1.5 text-xs" onClick={() => cancel(b._id)}>
                    Cancel
                  </button>
                )}
                <button type="button" className="btn-ghost !py-1.5 text-xs" onClick={() => pdf(b._id)}>
                  PDF receipt
                </button>
              </div>
            </div>
          );
        })}
        {!list.length && <p className="text-ink-200">No trips yet — explore and book a place.</p>}
      </div>
    </div>
  );
}
