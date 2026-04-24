import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "@/api/client";
import type { Booking, Property, User } from "@/types";
import { useToast } from "@/components/ToastHost";

export function HostBookingsPage() {
  const [list, setList] = useState<Booking[]>([]);
  const toast = useToast();

  const load = async () => {
    const { data } = await api.get("/bookings/host");
    setList(data.bookings);
  };

  useEffect(() => {
    void load();
  }, []);

  const confirm = async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/confirm`);
      toast("Booking confirmed", "ok");
      void load();
    } catch (e) {
      const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Could not confirm — ensure guest paid in demo mode", "err");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Incoming requests</h1>
      <p className="text-sm text-ink-200">Confirm only after demo payment is complete (course policy safe default).</p>
      <div className="mt-6 space-y-3">
        {list.map((b) => {
          const guest = b.guest as User;
          const prop = b.property as Property;
          return (
            <div key={b._id} className="panel p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="font-medium text-paper">{typeof prop === "object" ? prop.title : "Listing"}</p>
                  <p className="text-sm text-ink-200">
                    {guest?.name} · {format(new Date(b.checkIn), "MMM d")} – {format(new Date(b.checkOut), "MMM d")}
                  </p>
                  <p className="text-sm text-ink-200/90">
                    ${b.totalPrice} · {b.status} · payment: {b.paymentStatus}
                  </p>
                </div>
                {b.status === "pending" && (
                  <button type="button" className="btn-primary h-fit !py-2 text-xs" onClick={() => confirm(b._id)}>
                    Confirm stay
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {!list.length && <p className="text-ink-200">No requests yet.</p>}
      </div>
    </div>
  );
}
