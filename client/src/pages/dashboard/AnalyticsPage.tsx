import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type An = { listings: number; bookings: { total: number; pending: number; confirmed: number; cancelled: number }; revenue: number };

export function AnalyticsPage() {
  const [a, setA] = useState<An | null>(null);
  useEffect(() => {
    const run = async () => {
      const { data } = await api.get<{ success: boolean } & An>("/analytics/host");
      setA({ listings: data.listings, bookings: data.bookings, revenue: data.revenue });
    };
    void run();
  }, []);

  if (!a) {
    return <p className="text-ink-200">Loading…</p>;
  }
  const chart = [
    { name: "Pending", v: a.bookings.pending },
    { name: "Confirmed", v: a.bookings.confirmed },
    { name: "Cancelled", v: a.bookings.cancelled },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Host performance</h1>
      <p className="text-sm text-ink-200">Demo revenue is derived from successful mock checkouts, not real money.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="text-xs text-ink-200/80">Listings</p>
          <p className="text-2xl text-paper">{a.listings}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-ink-200/80">Bookings (all time)</p>
          <p className="text-2xl text-paper">{a.bookings.total}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-ink-200/80">Revenue (demo $)</p>
          <p className="text-2xl text-ember">{a.revenue}</p>
        </div>
      </div>
      <div className="panel mt-6 h-72 p-4">
        <p className="text-sm text-ink-200/90">Booking mix</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <XAxis dataKey="name" tick={{ fill: "#a3a8b5" }} />
              <YAxis allowDecimals={false} tick={{ fill: "#a3a8b5" }} />
              <Tooltip
                contentStyle={{ background: "#0c1118", border: "1px solid #ffffff14" }}
                labelStyle={{ color: "#e8e6df" }}
              />
              <Bar dataKey="v" fill="#2f4d46" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
