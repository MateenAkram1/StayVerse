import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/api/client";
import { PropertyCard } from "@/components/PropertyCard";
import type { Property } from "@/types";

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const q = params.get("q") || "";
  const city = params.get("city") || "";
  const min = params.get("min") || "";
  const max = params.get("max") || "";
  const type = params.get("type") || "";
  const checkIn = params.get("checkIn") || "";
  const checkOut = params.get("checkOut") || "";

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const search = new URLSearchParams();
      if (q) search.set("q", q);
      if (city) search.set("city", city);
      if (min) search.set("minPrice", min);
      if (max) search.set("maxPrice", max);
      if (type) search.set("type", type);
      if (checkIn) search.set("checkIn", checkIn);
      if (checkOut) search.set("checkOut", checkOut);
      const { data } = await api.get(`/properties?${search.toString()}`);
      setList(data.properties);
      setTotal(data.total);
      setLoading(false);
    };
    void run();
  }, [q, city, min, max, type, checkIn, checkOut]);

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    setParams(p);
  };

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl text-paper">Explore</h1>
      <p className="mt-1 text-ink-200">Search, filter, and open a listing — maps use OpenStreetMap (no billing).</p>
      <div className="mt-8 grid gap-4 rounded-xl border border-white/5 bg-ink-800/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Keywords
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="e.g. balcony, work desk"
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          City
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Lahore"
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Type
          <select
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={type}
            onChange={(e) => update("type", e.target.value)}
          >
            <option value="">Any</option>
            <option value="entire">Entire</option>
            <option value="room">Room</option>
            <option value="villa">Villa</option>
            <option value="cabin">Cabin</option>
            <option value="condo">Condo</option>
            <option value="shared">Shared</option>
          </select>
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Min $ / night
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={min}
            onChange={(e) => update("min", e.target.value)}
            min={0}
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Max $ / night
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={max}
            onChange={(e) => update("max", e.target.value)}
            min={0}
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Check-in
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={checkIn}
            onChange={(e) => update("checkIn", e.target.value)}
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80 col-span-1 sm:col-span-2">
          Check-out
          <input
            type="date"
            className="mt-1 w-full max-w-xs rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={checkOut}
            onChange={(e) => update("checkOut", e.target.value)}
          />
        </label>
      </div>
      <p className="mt-4 text-sm text-ink-200/90">
        {total} listing{total === 1 ? "" : "s"} found
        {loading ? " · searching…" : ""}
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {!loading &&
          list.map((p, i) => (
            <PropertyCard key={p._id} p={p} index={i} />
          ))}
      </div>
    </div>
  );
}
