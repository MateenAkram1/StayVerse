import { useEffect, useState } from "react";
import { api } from "@/api/client";

type Stats = { users: number; properties: number; bookings: number; blogPosts: number };

export function AdminPage() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    const run = async () => {
      const { data } = await api.get("/analytics/platform");
      setS(data.stats);
    };
    void run();
  }, []);

  if (!s) {
    return <p className="text-ink-200">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Platform</h1>
      <p className="text-sm text-ink-200">High-level metrics (admin only).</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Users", s.users],
            ["Listings", s.properties],
            ["Bookings", s.bookings],
            ["Public posts", s.blogPosts],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="panel p-4">
            <p className="text-xs text-ink-200/80">{k}</p>
            <p className="text-2xl text-paper">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
